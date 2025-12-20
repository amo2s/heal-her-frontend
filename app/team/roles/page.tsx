"use client"

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, MapPin, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RolesPage() {
  const roles = [
    {
      title: "Senior Medical Content Specialist",
      department: "Medical Team",
      location: "Remote / San Francisco",
      type: "Full-time",
      description:
        "Work with our medical team to develop, review, and maintain evidence-based medical protocols and guidance content.",
      responsibilities: [
        "Review and update medical protocols based on current guidelines",
        "Collaborate with AI team to ensure accurate medical content",
        "Conduct medical literature reviews",
        "Quality assurance for guidance accuracy",
      ],
      qualifications: [
        "MD, DO, PA, or NP with current license",
        "3+ years clinical experience, preferably emergency medicine",
        "Strong understanding of evidence-based medicine",
        "Excellent written communication skills",
      ],
    },
    {
      title: "AI Safety Engineer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      description:
        "Build and maintain safety systems that ensure our AI provides responsible, accurate medical guidance.",
      responsibilities: [
        "Develop safety guardrails for AI responses",
        "Implement testing frameworks for medical accuracy",
        "Monitor AI behavior for edge cases",
        "Collaborate with medical team on safety protocols",
      ],
      qualifications: [
        "5+ years experience in ML/AI engineering",
        "Experience with LLMs and safety systems",
        "Strong understanding of healthcare compliance",
        "Python, TensorFlow/PyTorch proficiency",
      ],
    },
    {
      title: "UX Researcher - Healthcare",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      description:
        "Conduct user research to understand how people interact with emergency guidance and improve accessibility.",
      responsibilities: [
        "Design and conduct user research studies",
        "Test with diverse user groups including underserved communities",
        "Analyze usability data and provide recommendations",
        "Advocate for accessibility and inclusion",
      ],
      qualifications: [
        "3+ years UX research experience",
        "Experience with healthcare or emergency response systems",
        "Strong qualitative and quantitative research skills",
        "Passion for accessibility and inclusive design",
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <PageHeader
        icon={<Briefcase className="h-8 w-8" />}
        title="Roles & Contributions"
        description="Join a mission-driven team working to democratize access to emergency medical guidance."
      />

      {/* Why Join */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl font-bold">Why Work With MedGuard AI?</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              This isn't just another tech job. Every line of code you write, every feature you design, every protocol
              you review directly impacts people facing medical emergencies. Your work saves lives.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Meaningful Impact</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Work on technology that directly improves health outcomes and serves underserved communities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Ethical AI Leadership</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Be part of building responsible AI in healthcare with ethics and safety as top priorities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Interdisciplinary Team</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Collaborate with medical professionals, engineers, ethicists, and designers from diverse backgrounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="border-b border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">Open Positions</h2>

          <div className="space-y-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">{role.title}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {role.department}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {role.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {role.type}
                          </div>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{role.description}</p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-semibold text-foreground">Key Responsibilities</h4>
                        <ul className="space-y-2">
                          {role.responsibilities.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-3 font-semibold text-foreground">Qualifications</h4>
                        <ul className="space-y-2">
                          {role.qualifications.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & Culture */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">Benefits & Culture</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Health & Wellness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Comprehensive health insurance</li>
                  <li>• Mental health support</li>
                  <li>• Wellness stipend</li>
                  <li>• Flexible work arrangements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Learning & development budget</li>
                  <li>• Conference attendance</li>
                  <li>• Mentorship programs</li>
                  <li>• Career advancement opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work-Life Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Generous PTO policy</li>
                  <li>• Remote-first culture</li>
                  <li>• Flexible schedules</li>
                  <li>• Parental leave</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl font-bold">Our Hiring Process</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We believe in a respectful, transparent hiring process that values your time and allows us to get to know
              each other.
            </p>

            <div className="mt-12 grid gap-6 text-left md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 text-2xl font-bold text-primary">1</div>
                  <h3 className="mb-2 font-semibold">Application Review</h3>
                  <p className="text-sm text-muted-foreground">We review all applications carefully</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 text-2xl font-bold text-primary">2</div>
                  <h3 className="mb-2 font-semibold">Initial Conversation</h3>
                  <p className="text-sm text-muted-foreground">30-minute chat about you and the role</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 text-2xl font-bold text-primary">3</div>
                  <h3 className="mb-2 font-semibold">Team Interviews</h3>
                  <p className="text-sm text-muted-foreground">Meet the team and discuss your expertise</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 text-2xl font-bold text-primary">4</div>
                  <h3 className="mb-2 font-semibold">Offer & Onboarding</h3>
                  <p className="text-sm text-muted-foreground">Welcome to the MedGuard family!</p>
                </CardContent>
              </Card>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Don't see a role that fits? We're always open to talking with exceptional people who share our mission.
            </p>
            <Button asChild className="mt-6 bg-transparent" variant="outline">
              <a href="mailto:careers@medguard.ai">Send Us Your Resume</a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
