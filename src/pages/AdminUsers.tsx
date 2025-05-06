
import React from 'react';
import UserManagement from '@/components/admin/users/UserManagement';
import { Helmet } from 'react-helmet-async';

const AdminUsers = () => {
  return (
    <>
      <Helmet>
        <title>User Management | Admin Panel</title>
      </Helmet>
      <UserManagement />
    </>
  );
};

export default AdminUsers;
