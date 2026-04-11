// Send request to deactivate an employee
export async function deactivateEmployee(id) {
  const response = await fetch(`http://localhost:5000/api/employees/${id}/deactivate`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Failed to deactivate employee.");
  }

  return data;
}