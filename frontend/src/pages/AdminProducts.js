import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import "../css/AdminProducts.css";
import axiosInstance from "../config";

function ProductForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      price: "",
      category: "",
      description: "",
      image: "",
      available: true,
    }
  );
  const [imageSource, setImageSource] = useState("url"); // 'url' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
    // Clear the URL field if a file is chosen
    setForm((f) => ({ ...f, image: "" }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    // If URL is typed, clear the file input
    if (name === "image") {
      setImageFile(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError("Name, price, and category are required.");
      return;
    }
    setError("");
    // Pass both form data and the image file to the save handler
    onSave(form, imageFile);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{initial ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label>Price</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
          <div className="image-source-selector">
            <label>
              <input
                type="radio"
                name="imageSource"
                value="url"
                checked={imageSource === "url"}
                onChange={() => setImageSource("url")}
              />
              Image URL
            </label>
            <label>
              <input
                type="radio"
                name="imageSource"
                value="upload"
                checked={imageSource === "upload"}
                onChange={() => setImageSource("upload")}
              />
              Upload Image
            </label>
          </div>

          {imageSource === "url" ? (
            <div>
              <label>Image URL</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          ) : (
            <div>
              <label>Image File</label>
              <input type="file" onChange={handleImageFileChange} />
            </div>
          )}

          <div className="admin-form-checkbox-row">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              id="available-checkbox"
            />
            <label htmlFor="available-checkbox">Available</label>
          </div>
          {error && <div className="signup-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="signup-btn"
              style={{ background: "#eee", color: "#be185d" }}
            >
              Cancel
            </button>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="signup-btn"
            style={{ background: "#eee", color: "#be185d" }}
          >
            Cancel
          </button>
          <button onClick={onConfirm} className="signup-btn" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts("");
    try {
      const res = await axiosInstance.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      setErrorProducts(err.response?.data?.message || err.message);
    } finally {
      setLoadingProducts(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // Product CRUD
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };
  const handleSaveProduct = async (form, imageFile) => {
    setSavingProduct(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = form.image; // Keep existing URL by default

      // 1. If a new image file is provided, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await axiosInstance.post(
          "/api/products/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        imageUrl = uploadRes.data.url;
      }

      // 2. Create or update the product with the final image URL
      const payload = { ...form, image: imageUrl };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingProduct) {
        await axiosInstance.put(
          `/api/products/${editingProduct._id}`,
          payload,
          config
        );
      } else {
        await axiosInstance.post("/api/products", payload, config);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts(); // Refresh product list
    } catch (err) {
      alert(
        `Failed to save product: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSavingProduct(false);
    }
  };
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setSavingProduct(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.delete(
        `/api/products/${deletingProduct._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      if (!res.status || res.status < 200 || res.status >= 300)
        throw new Error(data.message || "Failed to delete product");
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="admin-products-container">
      <div className="max-w-7xl mx-auto">
        <div className="admin-products-header">
          <h2>Products</h2>
          <button className="signup-btn" onClick={handleAddProduct}>
            Add Product
          </button>
        </div>
        {loadingProducts ? (
          <div>Loading products...</div>
        ) : errorProducts ? (
          <div className="signup-error">{errorProducts}</div>
        ) : (
          <div className="admin-products-table-container">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>₦{product.price?.toFixed(2)}</td>
                    <td>{product.category}</td>
                    <td>{product.available ? "Yes" : "No"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => setDeletingProduct(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showProductForm && (
          <ProductForm
            initial={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            loading={savingProduct}
          />
        )}
        {deletingProduct && (
          <ConfirmModal
            message={`Delete product "${deletingProduct.name}"?`}
            onConfirm={handleDeleteProduct}
            onCancel={() => setDeletingProduct(null)}
            loading={savingProduct}
          />
        )}
      </div>
    </div>
  );
}
