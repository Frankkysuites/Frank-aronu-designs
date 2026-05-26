import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Save, Plus, Upload, LogOut, KeyRound, X, Image, Video, FileText } from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";

// ... [Your types and DEFAULT_PROJECTS / DEFAULT_PROFILE remain the same] ...

const DEFAULT_PASSWORD = "admin123";

export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(/* your default profile */);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // ... other states ...

  const handleLogin = (e) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem("admin_password") || DEFAULT_PASSWORD;
    if (password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setPassword("");
      setError("");
    } else {
      setError("Incorrect password. Default is: admin123");
    }
  };

  // ... rest of your admin code (projects management etc.) ...

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 bg-gray-50 px-4">
        <div className="max-w-md w-full dark:bg-gray-800 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  // ... rest of your Admin Dashboard UI ...
}
