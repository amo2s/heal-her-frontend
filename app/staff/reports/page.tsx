"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Calendar } from "lucide-react"
import { StaffNav } from "@/components/staff-nav"
import { getCurrentUser } from "@/lib/auth"
import { mockReports, type Report } from "@/lib/chat-api"

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/staff/login")
    } else {
      setUser(currentUser)
    }
  }, [router])

  if (!user) return null

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: Report["type"]) => {
    return <FileText className="w-5 h-5 text-medical-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">View and generate clinical reports</p>
            </div>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              New Report
            </Button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(report.type)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 leading-tight">{report.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getStatusColor(report.status)} variant="outline">
                                {report.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {report.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                        <span>•</span>
                        <span>By {report.author}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
