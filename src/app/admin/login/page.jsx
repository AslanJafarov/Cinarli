import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAuthConfigured, isLoggedIn } from "@/lib/auth";

export const metadata = {
  title: "Daxil ol",
  robots: { index: false, follow: false },
};

const page = async () => {
  if (await isLoggedIn()) redirect("/admin");

  return (
    <main className="grid min-h-screen flex-1 place-items-center bg-[#13271f] px-5 py-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-3xl font-bold tracking-tight text-white">ÇINARLI</p>
        <p className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Admin panel
        </p>

        <div className="mt-8 rounded-2xl bg-[#f3f0e9] p-6 text-[#16201b] shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:p-7">
          <h1 className="text-xl font-bold">Daxil olun</h1>
          {isAuthConfigured() ? (
            <LoginForm />
          ) : (
            <p role="alert" className="mt-3 text-sm text-[#9b2f22]">
              Giriş hələ qurulmayıb: serverdə ADMIN_USERNAME, ADMIN_PASSWORD və
              ADMIN_SESSION_SECRET dəyişənlərini təyin edin.
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default page;
