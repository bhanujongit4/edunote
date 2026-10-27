import "./globals.css";

export const metadata = {
  title: "EduNote — Make room for big ideas",
  description: "A focused space for learning, notes, and big ideas.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
