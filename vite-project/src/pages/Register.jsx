import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { CheckCircle2, ArrowRight, User, Mail, Lock } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    const success = await register(name, email, password);
    setIsLoading(false);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground transition-colors duration-300">
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-zinc-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-20" />

        <div className="flex items-center gap-2 relative z-10">
          <CheckCircle2 className="h-8 w-8 text-indigo-400" />
          <span className="text-2xl font-bold tracking-tight text-white">TaskFlow</span>
        </div>
        <div className="max-w-md relative z-10">
          <h1 className="text-4xl font-extrabold mb-6 leading-tight tracking-tighter text-white">Start building better, together.</h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Create an account to manage your projects, tasks, and keep your entire team aligned. Seamlessly beautiful.
          </p>
        </div>
        <div className="text-sm text-zinc-600 relative z-10">
          © {new Date().getFullYear()} TaskFlow Inc. Premium Software Solutions.
        </div>
      </div>
      
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Join TaskFlow and optimize your workflow today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({...errors, name: null});
                  }}
                  className={`h-11 pl-10 bg-background border-input ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.name && <p className="text-[11px] font-medium text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({...errors, email: null});
                  }}
                  className={`h-11 pl-10 bg-background border-input ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-[11px] font-medium text-destructive mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({...errors, password: null});
                  }}
                  className={`h-11 pl-10 bg-background border-input ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.password && <p className="text-[11px] font-medium text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full h-11 text-md font-semibold" isLoading={isLoading}>
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
