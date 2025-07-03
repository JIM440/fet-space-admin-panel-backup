import React, { useState } from "react";
import { useLogin } from "../../../hooks/useAuth";
import ThemedText from "../../commons/typography/ThemedText";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "Admin" | "SuperAdmin" | "Student" | "Teacher"
  >("Admin");
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { identifier, password, role },
      {
        onSuccess: () => {
          // Redirect based on role
          window.location.href = role === "Student" ? "/student" : "/admin";
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <ThemedText variant="h1">FET SPACE</ThemedText>
          <ThemedText>Admin Login</ThemedText>
        </div>
        {error && (
          <ThemedText className="text-error mb-4">{error.message}</ThemedText>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
              Email:
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-background-neutral rounded-md text-neutral-text-secondary"
              placeholder="Enter email "
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background-neutral rounded-md text-neutral-text-secondary"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            {/* <label className="block text-sm font-medium text-neutral-text-secondary mb-2">Role:</label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'Admin' | 'SuperAdmin' | 'Student' | 'Teacher')
              }
              className="px-3 py-2 bg-background-neutral rounded-md text-neutral-text-secondary"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select> */}
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary-base rounded-md"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
