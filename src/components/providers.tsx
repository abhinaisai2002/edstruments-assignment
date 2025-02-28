import AuthProvider from "./AuthProvider";
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "./ui/toaster";


const Providers = ({
    children
}:{
    children: React.ReactNode
}) => {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>
                {children}
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
    )
}

export default Providers;