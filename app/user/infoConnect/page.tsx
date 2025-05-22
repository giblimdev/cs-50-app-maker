/* eslint-disable react/no-unescaped-entities */
"use client"; // important !

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const InfoConnectPage = () => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Bienvenue sur InfoConnect !
        </h1>
        <p className="text-lg md:text-xl font-light mb-8 max-w-md mx-auto">
          Vous êtes connecté ! Prêt à découvrir un univers de possibilités ?
        </p>
      </motion.div>

      <motion.button
        onClick={handleBackToHome}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(255,255,255,0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30"
      >
        Retour à l'accueil
      </motion.button>

      {/* Fond décoratif animé */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
      />
    </div>
  );
};

export default InfoConnectPage;
/* en utilisant  //@/lib/auth/auth-client.ts

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
*/

/*
const useSession: () => {
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            image?: string | null | undefined | undefined;
        };
        session: {
            id: string;
            createdAt: Date;
            ... 5 more ...;
            userAgent?: string | null | undefined | undefined;
        };
    } | null;
    isPending: boolean;
    error: BetterFetchError | null;
    refetch: () => void;
}
*/

/*
cree le store zustand qui affiche 
id, name,  mail
*/
