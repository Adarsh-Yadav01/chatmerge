"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users, Plus, Upload, Search, Contact, Filter, X, ChevronUp, ChevronDown } from "lucide-react";

const ContactsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    saveForWhatsApp: true,
    email: "",
    gender: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
const searchRef = useRef(null);

useEffect(() => {Search 
  if (isSearchOpen && searchRef.current) {
    searchRef.current.focus();
  }
}, [isSearchOpen]);


  const handleDownloadDemoFile = () => {
    const demoData = [
      ["FirstName", "LastName", "PhoneNumber", "Email", "Gender"],
      ["Rahul", "Sharma", "9876543210", "rahul.sharma@example.com", "Male"],
      ["Priya", "Singh", "9876543211", "priya.singh@example.com", "Female"],
      ["Amit", "Kumar", "9876543212", "amit.kumar@example.com", "Male"],
      ["Sneha", "Patel", "9876543213", "sneha.patel@example.com", "Female"],
      ["Vikram", "Reddy", "9876543214", "vikram.reddy@example.com", "Male"]
    ];

    const csvContent = demoData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts_demo.csv");
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone && !formData.email) {
      newErrors.contact = "Email or phone number is required.";
    }
    if (!formData.consent) {
      newErrors.consent = "Consent is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        saveForWhatsApp: true,
        email: "",
        gender: "",
        consent: false,
      });
    }
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setIsFilterOpen(false);
  };

  const contacts = [];

  const sortedContacts = [...contacts].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-bold text-black/70">
                Contacts
              </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
             {/* 🔍 Search button → expandable input */}
  {!isSearchOpen ? (
    <button
      onClick={() => setIsSearchOpen(true)}
      className="hidden sm:flex cursor-pointer items-center px-4 py-1 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
    >
      <Search className="h-4 w-4 mr-2" />
      Search
    </button>
  ) : (
    <div className="flex items-center transition-all duration-300 bg-gray-100 rounded-lg px-2">
      <Search className="h-4 w-4 mr-2 text-gray-500" />
      <input
        ref={searchRef}
        type="text"
        placeholder="Search contacts..."
        className="w-40 md:w-56 px-2 py-1 bg-transparent outline-none text-sm text-gray-700"
        onBlur={() => setIsSearchOpen(false)}
      />
    </div>
  )}
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="hidden sm:flex cursor-pointer items-center px-4 py-1 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                
                {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50">
  <div className="p-2">
    <h3 className="text-xs font-medium text-gray-600 mb-1">Sort by Name</h3>
    <div className="space-y-0.5">
      <button
        onClick={() => handleSortChange("asc")}
        className={`w-full flex items-center cursor-pointer justify-between px-2 py-1.5 rounded text-xs transition-colors ${
          sortOrder === "asc" 
            ? "bg-blue-50 text-blue-600" 
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span>A to Z</span>
        <ChevronUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => handleSortChange("desc")}
        className={`w-full flex items-center cursor-pointer justify-between px-2 py-1.5 rounded text-xs transition-colors ${
          sortOrder === "desc" 
            ? "bg-blue-50 text-blue-600" 
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span>Z to A</span>
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  </div>
</div>

                )}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center cursor-pointer px-4 py-1 text-gray-700 bg-white border-2 border-dashed border-black/30 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create New Contact</span>
                <span className="sm:hidden">New</span>
              </button>
              <button className="flex items-center cursor-pointer px-4 py-1 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button 
                onClick={handleDownloadDemoFile}
                className="flex items-center cursor-pointer px-4 py-1 bg-gradient-to-b from-indigo-300 via-indigo-400 to-indigo-500 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
                <Contact className="h-4 w-4 mr-2" />
                Demo File
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-4">
        <div className="bg-white h-[600px] rounded-2xl shadow-sm border border-gray-200 overflow-auto">
          {sortedContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-black/2">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedContacts.map((contact, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-black/2"
                      } hover:bg-gray-50`}
                    >
                      <td className="px-6 py-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {contact.gender}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {contact.status}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {contact.subscribed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 md:py-2 text-center">
              <div className="mx-auto w-48 h-48 md:w-64 md:h-64 mb-8 relative">
                <img
                  src="/contact.png"
                  alt="Empty State Illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                No contacts yet
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-2 max-w-md mx-auto leading-relaxed">
                Start building network by importing existing contacts
              </p>
              <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg mx-auto">
                Upload your external contacts and seamlessly integrate them with
                any marketing channel in ChatRealfam
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center px-6 py-2 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
                  <Upload className="h-5 w-5 mr-2" />
                  Import Contacts
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto cursor-pointer flex items-center justify-center px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors border-2 border-dashed border-blue-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Contact
                </button>
              </div>

              <div className="mt-8">
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Learn more about contact management
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Contacts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {contacts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-20 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-3">Create New Contact</h2>
              <p className="text-xs text-gray-500 mb-4">
                To add a contact, provide an email or phone number.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 Enter phone Number"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contact}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Select a gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label className="ml-1.5 text-xs text-gray-700">
                    I confirm that we have obtained appropriate consent to send
                    SMS, email, or other types of messages from contact(s) being
                    created or imported in compliance with applicable laws and
                    regulations and chatrealfam's Terms of Service.
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-red-500 text-xs mt-1">{errors.consent}</p>
                )}
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1 cursor-pointer bg-gradient-to-b from-gray-50 via-gray-100 to-gray-300 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-3 py-1 cursor-pointer bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;