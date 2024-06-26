"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router"

const BackButton = () => {
    const router = useRouter();
    return <Button
        onClick={() => router.back()}
        className="flex gap-2 items-center text-sm pb-2"
        variant='secondary'
    >
        <ChevronLeft className="h-4 w-4" /> Back
    </Button>
}

export default BackButton