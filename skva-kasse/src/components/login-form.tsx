import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login fehlgeschlagen");
      }

      // ✅ HIER: Token speichern
      localStorage.setItem("token", data.token);

      // ✅ Weiterleitung nach erfolgreichem Login
      navigate("/admin");
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <img src={Logo} alt="Logo" className="h-12 w-auto" />
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Bitte Benutzername und Passwort eingeben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
            <div>
              <Label className="mb-2" htmlFor="username">
                Benutzername
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="password">
                Passwort
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
            <Button type="submit" className="w-full mt-2">
              Einloggen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
