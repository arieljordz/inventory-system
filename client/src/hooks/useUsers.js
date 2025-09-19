// hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import { VerificationCodeEnum } from "../enums/enums";

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

  const removeUser = async (id) => {
    const verificationResult = await Swal.fire({
      title: "Verification Required",
      text: "Please enter the verification code to proceed with deletion:",
      input: "text",
      inputPlaceholder: "Enter verification code",
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Verify",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.style.textAlign = "center";
          input.style.fontSize = "18px";
          input.style.fontWeight = "bold";
          input.style.letterSpacing = "2px";
        }
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("Please enter a verification code");
          return false;
        }
        if (value !== VerificationCodeEnum.VERIFICATION_CODE) {
          Swal.showValidationMessage("Invalid verification code");
          return false;
        }
        return true;
      },
    });

    if (!verificationResult.isConfirmed) {
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));

      toast.success("User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      toast.error("Failed to delete user");
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
