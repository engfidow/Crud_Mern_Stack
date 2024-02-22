import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { MdPostAdd, MdEdit, MdDelete } from "react-icons/md";

Modal.setAppElement("#root");

function UserTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const MuiCache = createCache({
    key: "mui-datatables",
    prepend: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      // Check if the property is the image file. If it's not null, append it.
      if (formData[key] !== null) {
        dataToSend.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (selectedUser) {
        // For updating an existing user, use PATCH
        response = await axios.patch(
          `http://localhost:5000/api/users/${selectedUser._id}`,
          dataToSend
        );
      } else {
        // For adding a new user, use POST
        response = await axios.post(
          "http://localhost:5000/api/users",
          dataToSend
        );
      }

      alert("User saved successfully");
      closeModal();
      fetchData(); // Refresh the list to show the updated data
    } catch (error) {
      console.error(
        "Error saving user:",
        error.response ? error.response.data : error
      );
    }
  };

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setFormData({
      name: user ? user.name : "",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
      image: null,
    });
    setImagePreview(
      user && user.image ? `http://localhost:5000/${user.image}` : null
    );
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      fetchData();
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      image: null,
    });
    setSelectedUser(null);
    setImagePreview(null);
  };

  const columns = [
    {
      name: "image",
      label: "Image",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ? (
            <img
              src={
                value.startsWith("http")
                  ? value
                  : `http://localhost:5000/${value}`
              }
              alt="User"
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <p>No Image</p>
          );
        },
      },
    },
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    {
      name: "Actions",
      label: "Actions",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <div className="flex items-center">
              <div
                className="bg-green-500 hover:bg-green-300 text-white cursor-pointer mr-2 p-2 rounded"
                onClick={() => handleOpenModal(users[dataIndex])}
              >
                <MdEdit className="text-xl" />{" "}
                {/* Adjust icon size as needed */}
              </div>
              <div
                className="bg-red-500 hover:bg-red-300 text-white cursor-pointer p-2 rounded"
                onClick={() => handleDeleteUser(users[dataIndex]._id)}
              >
                <MdDelete className="text-xl" />{" "}
                {/* Adjust icon size as needed */}
              </div>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    filterType: "checkbox",
    selectableRows: "none",
  };

  const modalStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "500px",
    },
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <CacheProvider value={MuiCache}>
        <ThemeProvider theme={createTheme()}>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center"
          >
            <MdPostAdd className="mr-2" />
            Add New User
          </button>
          <MUIDataTable
            title={"User List"}
            data={users.map((user) => [
              user.image,
              user.name,
              user.email,
              user.phone,
              user,
            ])}
            columns={columns}
            options={options}
          />
        </ThemeProvider>
      </CacheProvider>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={modalStyle}
      >
        <h2 className="text-lg font-bold mb-4">
          {selectedUser ? "Edit User" : "Add New User"}
        </h2>
        <form onSubmit={handleFormSubmit} className="flex flex-col">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mx-auto h-20 w-20 rounded-full object-cover mb-4"
            />
          )}
          <input
            className="mb-4 p-2 border rounded"
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            className="mb-4 p-2 border rounded"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            className="mb-4 p-2 border rounded"
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <input
            className="mb-4 p-2 border rounded"
            type="file"
            name="image"
            onChange={handleInputChange}
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {selectedUser ? "Update" : "Register"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UserTable;
