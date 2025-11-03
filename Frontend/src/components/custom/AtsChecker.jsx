import React, { useState } from "react";

export default function AtsChecker() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_APP_URL || "http://localhost:5001/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jobDesc) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDesc", jobDesc);

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}api/ats/score`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error while checking ATS score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-xl max-w-3xl mx-auto mt-8 border">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        ATS Score Checker
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Paste Job Description
          </label>
          <textarea
            rows="6"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check ATS Score"}
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-2 text-indigo-700">
            ATS Score: {result.ats_score}%
          </h3>
          {result.feedback && (
            <ul className="list-disc ml-6 text-gray-700">
              {result.feedback.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <strong>Matched Keywords:</strong>
            <p className="text-sm text-green-700">
              {result.matched_keywords.join(", ") || "None"}
            </p>
          </div>

          <div className="mt-2">
            <strong>Missing Keywords:</strong>
            <p className="text-sm text-red-700">
              {result.missing_keywords.join(", ") || "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
