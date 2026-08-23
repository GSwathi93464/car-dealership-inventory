import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

interface Car {
  id: number;
  make: string;
  model: string;
  category: string;
  year: number;
  price: number;
  color: string;
  mileage: number;
  quantity: number;
  status: string;
  created_at: string;
}

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("");
const [quantity, setQuantity] = useState("");
const [search, setSearch] = useState("");
const [categoryFilter, setCategoryFilter] = useState("");
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");

  // ==========================================
  // CAR FORM STATES
  // ==========================================

  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [status, setStatus] = useState("available");

  // ==========================================
  // RESET CAR FORM
  // ==========================================

  const resetCarForm = () => {
    setMake("");
    setModel("");
    setYear("");
    setPrice("");
    setColor("");
    setMileage("");
    setStatus("available");
    setEditingCarId(null);
  };

  // ==========================================
  // FETCH CARS
  // ==========================================

  const fetchCars = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/cars`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch cars");
        return;
      }

      setCars(data.cars || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to fetch cars from backend.");
    } finally {
      setLoading(false);
    }
  };
  const searchCars = async () => {
  try {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (search) params.append("make", search);
    if (categoryFilter) params.append("category", categoryFilter);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);

    const response = await fetch(
      `${API_URL}/api/cars/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setCars(data.cars);
    }
  } catch (error) {
    console.error(error);
  }
};

  // ==========================================
  // ADD CAR
  // ==========================================
  const handlePurchaseCar = async (id: number) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/cars/${id}/purchase`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setMessage(data.message);

    if (response.ok) {
      fetchCars();
    }
  } catch (error) {
    console.error(error);
    setMessage("Purchase failed.");
  }
};
  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make,
          model,
          year: Number(year),
          price: Number(price),
          color,
          mileage: Number(mileage),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add car");
        return;
      }

      setMessage("Car added successfully! 🚗");

      resetCarForm();
      setShowCarForm(false);

      fetchCars();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };
  
  

  // ==========================================
  // START EDIT CAR
  // ==========================================

  const startEditCar = (car: Car) => {
    setEditingCarId(car.id);

    setMake(car.make);
    setModel(car.model);
    setYear(String(car.year));
    setPrice(String(car.price));
    setColor(car.color);
    setMileage(String(car.mileage));
    setStatus(car.status);

    setShowCarForm(true);
    setMessage("");
  };

  // ==========================================
  // UPDATE CAR
  // ==========================================

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (editingCarId === null) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/cars/${editingCarId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
  make,
  model,
  category,
  year: Number(year),
  price: Number(price),
  color,
  mileage: Number(mileage),
  quantity: Number(quantity),
  status,
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update car");
        return;
      }

      setMessage("Car updated successfully! 🚗");

      resetCarForm();
      setShowCarForm(false);

      fetchCars();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  // ==========================================
  // DELETE CAR
  // ==========================================

  const handleDeleteCar = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/cars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete car");
        return;
      }

      setMessage("Car deleted successfully! 🚗");

      fetchCars();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  // ==========================================
  // LOGIN / REGISTER
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
  localStorage.setItem("token", data.token);

  const payload = JSON.parse(
    atob(data.token.split(".")[1])
  );

  setUserRole(payload.role);
  localStorage.setItem("role", payload.role);

  setIsLoggedIn(true);
  setMessage("Login successful!");
} else {
        setMessage("Registration successful!");
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  // ==========================================
  // FETCH CARS AFTER LOGIN
  // ==========================================

  useEffect(() => {
    if (isLoggedIn) {
      fetchCars();
    }
  }, [isLoggedIn]);
  const handleRestockCar = async (id: number) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  const amount = window.prompt("Enter quantity to restock:");

  if (!amount || Number(amount) <= 0) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/cars/${id}/restock`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: Number(amount),
        }),
      }
    );

    const data = await response.json();

    setMessage(data.message);

    if (response.ok) {
      fetchCars();
    }
  } catch (error) {
    console.error(error);
    setMessage("Restock failed.");
  }
};

  // ==========================================
  // INVENTORY DASHBOARD
  // ==========================================

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="card inventory-card">

          {/* HEADER */}

          <div className="inventory-header">
            <div>
              <h1>🚗 Car Inventory</h1>

              <p className="subtitle">
                Car Dealership Inventory Management System
              </p>
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setCars([]);
                setMessage("");
                setShowCarForm(false);
                resetCarForm();
              }}
            >
              Logout
            </button>
          </div>

          <hr />

          {/* DASHBOARD HEADER */}

          <div className="dashboard-header">
  <h2>Inventory Dashboard</h2>

  {userRole === "admin" && (
    <button
      className="add-car-btn"
      onClick={() => {
        resetCarForm();
        setShowCarForm(true);
        setMessage("");
      }}
    >
      + Add Car
    </button>
  )}
</div>
          <div className="search-panel">

  <input
    type="text"
    placeholder="Search by make..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <input
    type="text"
    placeholder="Category..."
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
  />

  <input
    type="number"
    placeholder="Min Price"
    value={minPrice}
    onChange={(e) => setMinPrice(e.target.value)}
  />

  <input
    type="number"
    placeholder="Max Price"
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
  />

  <button
    type="button"
    className="add-car-btn"
    onClick={searchCars}
  >
    Search
  </button>

  <button
    type="button"
    className="logout-btn"
    onClick={fetchCars}
  >
    Reset
  </button>

</div>

          {/* ADD / EDIT CAR FORM */}

          {showCarForm && (
            <div className="add-car-form">

              <h3>
                {editingCarId ? "Edit Car" : "Add New Car"}
              </h3>

              <form
                onSubmit={
                  editingCarId
                    ? handleUpdateCar
                    : handleAddCar
                }
              >

                {/* MAKE */}

                <div className="form-group">
                  <label>Make</label>

                  <input
                    type="text"
                    placeholder="Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    required
                  />
                </div>

                {/* MODEL */}

                <div className="form-group">
                  <label>Model</label>

                  <input
                    type="text"
                    placeholder="Camry"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  placeholder="Sedan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
                </div>

                {/* YEAR */}

                <div className="form-group">
                  <label>Year</label>

                  <input
                    type="number"
                    placeholder="2024"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>

                {/* PRICE */}

                <div className="form-group">
                  <label>Price</label>

                  <input
                    type="number"
                    placeholder="2500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                {/* COLOR */}

                <div className="form-group">
                  <label>Color</label>

                  <input
                    type="text"
                    placeholder="White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                  />
                </div>

                {/* MILEAGE */}

                <div className="form-group">
                  <label>Mileage (km)</label>

                  <input
                    type="number"
                    placeholder="15000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  placeholder="10"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                </div>

                {/* STATUS */}

                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">
                      Available
                    </option>

                    <option value="sold">
                      Sold
                    </option>

                    <option value="reserved">
                      Reserved
                    </option>
                  </select>
                </div>

                {/* SUBMIT BUTTON */}

                <button
                  type="submit"
                  className="submit-btn"
                >
                  {editingCarId
                    ? "Update Car"
                    : "Add Car"}
                </button>

                {/* CANCEL BUTTON */}

                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => {
                    setShowCarForm(false);
                    resetCarForm();
                  }}
                >
                  Cancel
                </button>

              </form>
            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          {/* INVENTORY */}

          {loading ? (
            <p>Loading cars...</p>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <h3>No cars found 🚗</h3>

              <p>
                Your inventory is currently empty.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Color</th>
                    <th>Mileage</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>

                      <td>{car.id}</td>

                      <td>{car.make}</td>

                      <td>{car.model}</td>

                      <td>{car.category}</td>

                      <td>{car.year}</td>

                      <td>
                        ₹{Number(car.price).toLocaleString()} 
                      </td>

                      <td>{car.color}</td>

                      <td>
                        {Number(car.mileage).toLocaleString()} km
                      </td>

                      <td>
                      <strong>{car.quantity}</strong>
                      </td>

                      <td>
                        <span className="status">
                          {car.status}
                        </span>
                      </td>

                      <td>

                        {userRole === "admin" ? (
  <>
    <button
      className="edit-btn"
      onClick={() => startEditCar(car)}
    >
      Edit
    </button>

    <button
      className="delete-btn"
      onClick={() => handleDeleteCar(car.id)}
    >
      Delete
    </button>

    <button
      className="restock-btn"
      onClick={() => handleRestockCar(car.id)}
    >
      Restock
    </button>
  </>
) : (
  <button
    className="purchase-btn"
    disabled={car.quantity === 0}
    onClick={() => handlePurchaseCar(car.id)}
  >
    {car.quantity === 0 ? "Out of Stock" : "Purchase"}
  </button>
)}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    );
  }
  
  // ==========================================
  // LOGIN / REGISTER PAGE
  // ==========================================

  return (
    <div className="app">

      <div className="card">

        <h1>🚗 Car Dealership</h1>

        <p className="subtitle">
          Inventory Management System
        </p>

        {/* LOGIN / REGISTER TABS */}

        <div className="tabs">

          <button
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
          >
            Register
          </button>

        </div>

        {/* LOGIN / REGISTER FORM */}

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="form-group">

              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

            </div>
          )}

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <button
            type="submit"
            className="submit-btn"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>

        </form>

        {/* MESSAGE */}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        {/* SWITCH LOGIN / REGISTER */}

        <p className="switch-text">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            className="switch-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>

        </p>

      </div>

    </div>
  );
}

export default App;