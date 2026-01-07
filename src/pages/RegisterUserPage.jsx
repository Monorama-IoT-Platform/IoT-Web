import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { saveToken, clearToken } from "../utils/tokenStorage";
import { formatPhoneNumber, getPhonePlaceholder } from "../utils/formatter";

function RegisterUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    phoneNumber: "",
    nationalCode: "KR",
    dateOfBirth: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    if (accessToken) {
      saveToken(accessToken);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const formatted = formatPhoneNumber(value, form.nationalCode);
      setForm((prev) => ({ ...prev, phoneNumber: formatted }));
    } else if (name === "nationalSelect") {
      const codeMap = { "+82": "KR", "+1": "US", "+81": "JP" };
      const newCode = codeMap[value] || "KR";
      setForm((prev) => ({
        ...prev,
        nationalCode: newCode,
        phoneNumber: "",
      }));
    } else if (name === "dateOfBirth") {
      const year = value.split("-")[0];
      if (year && year.length > 4) {
        return;
      }
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitForm = {
        ...form,
        phoneNumber: form.phoneNumber.replace(/-/g, ""),
      };

      await axiosInstance.patch("/auth/register/pm", submitForm);
      alert("회원가입이 완료되었습니다. 다시 로그인해주세요.");
      clearToken();

      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 100);
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(
        serverError
          ? `[${serverError.code}] ${serverError.message}`
          : "가입 실패"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-200 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-indigo-100 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Sign Up
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-indigo-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="border-2 border-indigo-200 rounded-lg px-4 py-2"
            placeholder="e.g. Sangjin Lee"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-indigo-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="border-2 border-indigo-200 rounded-lg px-4 py-2"
            placeholder="example@gmail.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-indigo-700">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="border-2 border-indigo-200 rounded-lg px-4 py-2"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-indigo-700">Phone Number</label>
          <div className="flex gap-2">
            <select
              name="nationalSelect"
              value={
                form.nationalCode === "KR"
                  ? "+82"
                  : form.nationalCode === "US"
                  ? "+1"
                  : "+81"
              }
              onChange={handleChange}
              className="border-2 border-indigo-200 rounded-lg px-2 py-2"
            >
              <option value="+82">+82</option>
              <option value="+1">+1</option>
              <option value="+81">+81</option>
            </select>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="flex-1 border-2 border-indigo-200 rounded-lg px-4 py-2"
              placeholder={getPhonePlaceholder(form.nationalCode)}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-indigo-700">Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            max={today}
            className="border-2 border-indigo-200 rounded-lg px-4 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg mt-4 transition-all hover:opacity-90"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default RegisterUserPage;
