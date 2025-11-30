import React, { useState } from 'react';
import { User } from '../types';
import { IconArrowLeft, IconLock, IconUser, IconCheck } from './Icons';

interface UserManagementProps {
  users: User[];
  onUpdateUserPassword: (email: string, newPass: string) => void;
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUserPassword, onBack }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserEmail && newPassword) {
      onUpdateUserPassword(selectedUserEmail, newPassword);
      setMessage(`Password updated for ${selectedUserEmail}`);
      setNewPassword('');
      setSelectedUserEmail(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      <button onClick={onBack} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <IconArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 sm:px-8 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <IconUser className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-orange-400" />
            User Management
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Manage technician accounts and credentials.</p>
        </div>

        <div className="p-4 sm:p-8">
          {message && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
              <IconCheck className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isAdmin ? 'Super Admin' : 'Technician'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                            setSelectedUserEmail(user.email);
                            setMessage('');
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                      >
                        <IconLock className="w-4 h-4 mr-1" /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUserEmail && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password for <span className="text-orange-600">{selectedUserEmail}</span></h3>
              <form onSubmit={handlePasswordReset} className="flex gap-4 items-end">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                      setSelectedUserEmail(null);
                      setNewPassword('');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};