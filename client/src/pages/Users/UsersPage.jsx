// src/pages/ItemInventory/UsersPage.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import UsersTable from "./UsersTable";
import UsersModal from "./UsersModal";
import { useUsers } from "../../hooks/useUsers";

const UsersPage = () => {
  const {
    users,
    pagination,
    loading,
    error,
    handlePageChange,
    handleSearch,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
  } = useUsers({ page: 1, limit: 10 });

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    picture: "",
    password: "",
    isVerified: true,
    role:"",
  });

  const openCreate = () => {
    setIsEditMode(false);
    setForm({
      name: "",
      email: "",
      picture: "",
      password: "",
      isVerified: true,
      role:"",
    });
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setIsEditMode(true);
    setForm(user);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleDelete = async (userId) => {
    try {
      await removeUser(userId);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    try {
      if (isEditMode) {
        await editUser(form._id, form);
        toast.success("User updated successfully.");
      } else {
        await addUser(form);
        toast.success("User created successfully.");
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  useEffect(() => {
    handlePageChange(currentPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <>
      <Navpath levelOne="User Management" levelTwo="Home" levelThree="Users" />

      <section className="content">
        <div className="container-fluid">
          {/* Add User Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary"
              onClick={openCreate}
              disabled={loading}
            >
              <i className="fas fa-plus mr-1"></i> Add User
            </button>
          </div>

          {/* Search */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              handleSearch(val);
            }}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            disabled={loading}
          />

          {/* Table */}
          <UsersTable
            users={users}
            onEdit={openEdit}
            onDelete={handleDelete}
            loading={loading}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={pagination.page}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
            disabled={loading}
          />

          {/* User Modal */}
          <UsersModal
            isOpen={isModalOpen}
            onClose={closeModal}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isEditMode={isEditMode}
          />
        </div>
      </section>
    </>
  );
};

export default UsersPage;
