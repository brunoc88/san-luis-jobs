import LoginSchema from "@/lib/schemas/login.schema"
import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { authorizeUser } from "@/app/api/auth/credentials-authorize"
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        user: { label: "Email o usuario", type: "text" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials) return null

        const parsed = await LoginSchema.safeParseAsync(credentials)
        if (!parsed.success) return null

        const user = await authorizeUser(parsed.data)
        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role
        }
      }

    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.role = user.role
        }

        if (account?.provider === "google") {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                username: user.email!,
                password: "",
                role: "common",
                isActive: true,
                pic: user.image ?? "/default-avatar.png" //revisar
              }
            })
          }

          token.id = String(dbUser.id)
          token.email = dbUser.email
          token.name = dbUser.username
          token.role = dbUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }