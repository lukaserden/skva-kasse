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
import { loginUser } from "@/api"; // ⬅️ NEU

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
      const accessToken = await loginUser(username, password);

      if (!accessToken) {
        throw new Error("Kein Access Token erhalten.");
      }

      // Weiterleitung nach erfolgreichem Login
      navigate("/admin");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Login fehlgeschlagen");
      }
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
