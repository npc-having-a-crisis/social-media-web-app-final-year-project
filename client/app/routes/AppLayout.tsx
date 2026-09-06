import { Navigate, Outlet, useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { AppSidebar } from "~/components/AppSidebar"
import { ExploreSidebar } from "~/components/ExploreSidebar"
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { useMe } from "~/hooks/useMe"
import VerifyEmailPrompt from "~/components/VerifyEmailPrompt"
import { LoadingState } from "~/components/ui/spinner"
import { Button } from "~/components/ui/button"
import { X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { APIResponse } from "~/lib/types"
import { api } from "~/lib/axios"

export default function AppLayout() {
    const { isAuth, isInitialLoading, data: user } = useMe()
    const location = useLocation()

    const navigate = useNavigate()

    const [showSecurityQuestionReminder, setShowSecurityQuestionReminder] =
    useState(false)

    const { data: securityQuestionData } = useQuery({
        queryKey: ["security-question"],
        queryFn: async () => {
            const res = await api.get<APIResponse>(
                "/api/users/security-question"
            )

        return res.data.data as {
            configured: boolean
            question: string | null
        }
    },
})

    useEffect(() => {
        const dismissed = sessionStorage.getItem("security-question-reminder-dismissed") === "true"

    if (
        user &&
        user.emailVerified &&
        securityQuestionData &&
        !securityQuestionData.configured &&
        !dismissed
    ) {
        setShowSecurityQuestionReminder(true)
    }
}, [user, securityQuestionData])

const dismissSecurityQuestionReminder = () => {
    sessionStorage.setItem(
        "security-question-reminder-dismissed",
        "true"
    )

    setShowSecurityQuestionReminder(false)
}


    if (isInitialLoading) return <LoadingState label="Loading account..." variant="page" />

    if (!isAuth) {
        return <Navigate to="/signin" replace state={{ from: location }} />
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full min-w-screen bg-background">
                <AppSidebar />
                <main className="flex min-w-0 flex-1 flex-col">
                    <div className="sticky top-0 z-20 flex items-center border-b bg-background/95 px-4 py-3 backdrop-blur">
                        <div className="md:hidden">
                            <SidebarTrigger />
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                           <VerifyEmailPrompt />

                            {showSecurityQuestionReminder && (
                            <div className="fixed bottom-6 right-6 z-50 w-[360px] rounded-lg border bg-background p-5 shadow-lg">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold">
                                            Set up your security question
                                        </h3>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Add a security question to provide an additional layer
                                            of protection for high-risk sign-ins.
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={dismissSecurityQuestionReminder}
                                    >
                                        <X />
                                    </Button>
                                </div>

                                <Button
                                    className="mt-4 w-full"
                                    onClick={() => {
                                        setShowSecurityQuestionReminder(false)
                                        navigate("/settings/security")
                                    }}
                                >
                                    Set up security question
                                </Button>
                            </div>
)}

<Outlet />
                        </div>
                        {!location.pathname.startsWith("/messages") && <ExploreSidebar />}
                    </div>
                </main>

            </div>
        </SidebarProvider>
    )
}
