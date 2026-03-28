// /app/api/facebook/adaccount/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { decode } from 'next-auth/jwt';
import axios from 'axios';

const FB_GRAPH = 'https://graph.facebook.com/v20.0';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  const campaignId = searchParams.get('campaignId');

  const cookies = req.headers.get('cookie') || '';
  let session = await getServerSession(authOptions);

  // Fallback: decode JWT
  if (!session?.user?.facebookAccessToken) {
    const token = cookies.split('; ').find(c => c.startsWith('__Secure-next-auth.session-token='))?.split('=')[1];
    if (token) {
      const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET });
      session = { user: { facebookAccessToken: decoded.facebookAccessToken } };
    }
  }

  if (!session?.user?.facebookAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = session.user.facebookAccessToken;

  try {
    // 1. List all ad accounts
    if (!accountId) {
      const me = await axios.get(`${FB_GRAPH}/me`, { params: { access_token: token } });
      const res = await axios.get(`${FB_GRAPH}/${me.data.id}/adaccounts`, {
        params: {
          fields: 'account_id,name,currency,timezone_name,amount_spent,spend_cap',
          access_token: token
        }
      });
      return NextResponse.json({ accounts: res.data.data });
    }

    // 2. Get full account + all campaigns
    if (accountId && !campaignId) {
      const [accountRes, campaignsRes] = await Promise.all([
        axios.get(`${FB_GRAPH}/act_${accountId}`, {
          params: {
            fields: [
              'account_id', 'name', 'account_status', 'currency', 'timezone_name',
              'amount_spent', 'balance', 'spend_cap',
              'funding_source_details', 'business', 'owner', 'created_time',
              'age', 'is_prepay_account',
            ].join(','),
            access_token: token
          }
        }),
        axios.get(`${FB_GRAPH}/act_${accountId}/campaigns`, {
          params: {
            fields: 'id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_date,stop_time',
            access_token: token,
            limit: 100
          }
        })
      ]);

      const account = cleanAccount(accountRes.data);
      const campaigns = campaignsRes.data.data;

      return NextResponse.json({ account, campaigns });
    }

    // 3. Get full campaign details
    if (campaignId) {
      const res = await axios.get(`${FB_GRAPH}/${campaignId}`, {
        params: {
          fields: [
            'id', 'name', 'status', 'effective_status', 'objective',
            'daily_budget', 'lifetime_budget', 'budget_remaining',
            'start_date', 'stop_time', 'created_time', 'updated_time',
            'special_ad_categories', 'buying_type'
          ].join(','),
          access_token: token
        }
      });
      return NextResponse.json({ campaign: res.data });
    }

  } catch (err) {
    const msg = err.response?.data?.error?.message || 'API Error';
    console.error('AdAccount API:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Helper: clean nested objects
function cleanAccount(data) {
  return {
    ...data,
    business: data.business ? { id: data.business.id, name: data.business.name } : null,
    funding_source_details: data.funding_source_details ? {
      type: data.funding_source_details.type,
      display: data.funding_source_details.display_string
    } : null
  };
}