import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [data, setData] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [id, setId] = useState(null);
  const [isUpdate, setIsUpdate] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

//ये state track करेगी कौन सा column sort हो रहा है और किस direction (ASC/DESC) में।
const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });


  // ------------------ LOAD DATA ------------------
  const loadData = () => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ------------------ VALIDATION ------------------
  function validateForm() {
    if (!firstName.trim() || !lastName.trim() || !String(age).trim()) {
      alert("All fields are required!");
      return false;
    }
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge <= 0) {
      alert("Age must be a valid number greater than 0");
      return false;
    }
    return true;
  }

  // ------------------ ADD USER ------------------
  async function saveData() {
    if (!validateForm()) return;

    const newUser = {
      first_name: firstName,
      last_name: lastName,
      age: age,
    };

    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      alert("User Added Successfully!");
      loadData();
      clearData();
    }
  }

  // ------------------ UPDATE USER ------------------
  async function updateData() {
    if (!validateForm()) return;

    const updatedUser = {
      first_name: firstName,
      last_name: lastName,
      age: age,
    };

    const res = await fetch(`http://localhost:5000/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (res.ok) {
      alert("Updated Successfully!");
      loadData();
      clearData();
      setIsUpdate(true);
    }
  }

  // ------------------ DELETE USER ------------------
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete?")) {
      await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });
      loadData();
    }
  }

  // ------------------ EDIT ------------------
  function handleEdit(userId) {
    const user = data.find((item) => item.id === userId);
    if (user) {
      setIsUpdate(false);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setAge(user.age);
      setId(user.id);
    }
  }

  // ------------------ CLEAR ------------------
  function clearData() {
    setFirstName("");
    setLastName("");
    setAge("");
    setId(null);
    setIsUpdate(true);
  }

//Sorting Function...................................
  function sortData(columnName) {
  let direction = "asc";

  // agar same column dobara click hua → asc ↔ desc toggle hoga
  if (sortConfig.key === columnName && sortConfig.direction === "asc") {
    direction = "desc";
  }

  setSortConfig({ key: columnName, direction });

  const sorted = [...data].sort((a, b) => {
    if (a[columnName] < b[columnName]) return direction === "asc" ? -1 : 1;
    if (a[columnName] > b[columnName]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  setData(sorted);
}


  // ------------------ SEARCH FILTER ------------------
  const filteredData = data.filter((item) =>
    item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.age.toString().includes(searchTerm)
  );

  // ------------------ PAGINATION ------------------
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = filteredData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(filteredData.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-primary">Student Management System</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name or age..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset page on search
        }}
      />

      <div className="card p-4 shadow-lg mb-4">
        <h4 className="mb-3">{isUpdate ? "Add New Student" : "Update Student"}</h4>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              placeholder="Enter first name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              placeholder="Enter last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-control"
              value={age}
              placeholder="Enter age"
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>

        <button
          className={`btn ${isUpdate ? "btn-primary" : "btn-warning"} me-2`}
          onClick={isUpdate ? saveData : updateData}
        >
          {isUpdate ? "Submit" : "Update"}
        </button>

        <button className="btn btn-secondary" onClick={clearData}>
          Clear
        </button>
      </div>

      {/* ---- TABLE ---- */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Age</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((value) => (
              <tr key={value.id}>
                <td>{value.id}</td>
                <td>{value.first_name}</td>
                <td>{value.last_name}</td>
                <td>{value.age}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(value.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(value.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

Table Headers को clickable बनाओ
<thead className="table-dark">
  <tr>
    <th>ID</th>

    <th onClick={() => sortData("first_name")} style={{ cursor: "pointer" }}>
      First Name ⬍
    </th>

    <th onClick={() => sortData("last_name")} style={{ cursor: "pointer" }}>
      Last Name ⬍
    </th>

    <th onClick={() => sortData("age")} style={{ cursor: "pointer" }}>
      Age ⬍
    </th>

    <th>Actions</th>
  </tr>
</thead>



      {/* ---- Pagination ---- */}
      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
          </li>

          {numbers.map((n, i) => (
            <li
              className={`page-item ${currentPage === n ? "active" : ""}`}
              key={i}
            >
              <button className="page-link" onClick={() => setCurrentPage(n)}>
                {n}
              </button>
            </li>
          ))}

          <li className="page-item">
            <button
              className="page-link"
              onClick={() => currentPage < npage && setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default App;
