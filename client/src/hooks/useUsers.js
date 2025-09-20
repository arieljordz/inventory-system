// hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import { verifyAction, confirmAction } from "./useVerification";

export const useUsers = (
  initialParams = { page: 1, limit: 10, search: "" }
) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialParams.page,
    limit: initialParams.limit,
    totalPages: 0,
  });
  const [search, setSearch] = useState(initialParams.search || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getUsers({
          page: params.page || pagination.page,
          limit: params.limit || pagination.limit,
          search: params.search ?? search,
        });

        setUsers(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search]
  );

  const fetchUserById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await getUserById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const { data } = await createUser(userData);
      setUsers((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editUser = useCallback(async (id, userData) => {
    setLoading(true);
    try {
      const { data } = await updateUser(id, userData);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...data } : u))
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Main delete handler
  const removeUser = async (id) => {
    // Step 1: Verification
    const isVerified = await verifyAction();
    if (!isVerified) return;

    // Step 2: Confirmation
    const isConfirmed = await confirmAction({
      title: "Are you sure?",
      text: "This will permanently delete the user.",
      confirmText: "Yes, delete it!",
      confirmColor: "#d33",
    });
    if (!isConfirmed) return;

    // Step 3: Deletion
    setLoading(true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    fetchUsers({ page: newPage });
  };

  const handleSearch = (newSearch) => {
    setSearch(newSearch);
    fetchUsers({ search: newSearch, page: 1 });
  };

  return {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    addUser,
    editUser,
    removeUser,
    handlePageChange,
    handleSearch,
  };
};
