import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "en" | "es";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // ── Navigation ──────────────────────────────────────────────────────────
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.projects": "Projects",
    "nav.messages": "Messages",
    "nav.browse": "Browse",
    "nav.jobs": "My Jobs",
    "nav.earnings": "Earnings",
    "nav.dashboard": "Dashboard",
    "nav.cases": "Cases",

    // ── Trust ───────────────────────────────────────────────────────────────
    "trust.tagline": "Your money is protected until you approve",
    "trust.subtitle": "TrustVibe holds funds safely — released only when you confirm the work is done.",

    // ── Buttons ─────────────────────────────────────────────────────────────
    "btn.fundEscrow": "Fund Escrow",
    "btn.approveRelease": "Approve & Release",
    "btn.submitQuote": "Submit Quote",
    "btn.raiseIssue": "Raise an Issue",
    "btn.leaveReview": "Leave a Review",
    "btn.submitReview": "Submit Review",
    "btn.viewProject": "View Project",
    "btn.acceptQuote": "Accept This Quote",
    "btn.signIn": "Sign In",
    "btn.viewProfile": "View Profile",
    "btn.sendMessage": "Send Message",
    "btn.backHome": "Back to Home",

    // ── Status labels ────────────────────────────────────────────────────────
    "status.draft": "Draft",
    "status.open": "Open for Quotes",
    "status.funded": "Funded",
    "status.in_progress": "In Progress",
    "status.complete_requested": "Completion Requested",
    "status.completed": "Completed",
    "status.disputed": "Disputed",

    // ── Generic labels ───────────────────────────────────────────────────────
    "label.rating": "Rating",
    "label.jobs": "Jobs",
    "label.response": "Response",
    "label.verified": "Verified",
    "label.escrow": "In Escrow",
    "label.earned": "Earned",
    "label.fee": "TrustVibe fee",
    "label.youReceive": "You receive",
    "label.totalCharged": "Total charged",
    "label.activeJobs": "Active Jobs",
    "label.pendingQuotes": "Pending Quotes",
    "label.recentActivity": "Recent Activity",
    "label.portfolio": "Portfolio",
    "label.reviews": "Reviews",
    "label.about": "About",
    "label.badges": "Trust Badges",
    "label.budget": "Budget",
    "label.viewAll": "View all",

    // ── Messages ─────────────────────────────────────────────────────────────
    "msg.placeholder": "Type a message...",
    "msg.send": "Send",
    "msg.empty": "No messages yet",
    "msg.emptySub": "Accept a quote to start chatting with your contractor.",
    "msg.startConversation": "Send the first message to get started.",

    // ── Review ───────────────────────────────────────────────────────────────
    "review.title": "Rate your experience",
    "review.placeholder": "Tell others about your experience...",
    "review.success": "Thank you for your review!",
    "review.backHome": "Back to Home",
    "review.findMore": "Find More Contractors",
    "review.successSub": "Your review helps other homeowners make better decisions. Thank you for using TrustVibe!",
    "review.whatsStoodOut": "What stood out?",
    "review.publicNote": "Your review is public and helps other homeowners find reliable contractors.",
    "review.starPrompt": "Tap a star to rate",
    "review.star1": "Not satisfied",
    "review.star2": "Below expectations",
    "review.star3": "It was okay",
    "review.star4": "Great experience!",
    "review.star5": "Outstanding! 🎉",

    // ── Review tags ──────────────────────────────────────────────────────────
    "tag.onTime": "On Time",
    "tag.cleanWork": "Clean Work",
    "tag.professional": "Professional",
    "tag.fairPrice": "Fair Price",
    "tag.communicative": "Communicative",
    "tag.qualityWork": "Quality Work",
    "tag.wouldHireAgain": "Would Hire Again",
    "tag.fast": "Fast",
    "tag.detailOriented": "Detail-Oriented",

    // ── Escrow callout ───────────────────────────────────────────────────────
    "escrow.protected": "TrustVibe Escrow Protection",
    "escrow.protected.sub": "Your money is held safely until you approve the work.",
    "escrow.guarantee1": "Money held until YOU approve the completed work",
    "escrow.guarantee2": "Full refund if contractor doesn't start within agreed time",
    "escrow.guarantee3": "Dispute resolution included at no extra cost",
    "escrow.guarantee4": "Funds released only on your explicit confirmation",

    // ── Login ─────────────────────────────────────────────────────────────────
    "login.welcome": "Welcome back",
    "login.tagline": "Pay safely for home services in Puerto Rico",
    "login.email": "Email address",
    "login.password": "Password",
    "login.demo": "Try a demo account",
    "login.error": "Invalid email or password. Please try again.",
    "login.signingIn": "Signing in...",
    "login.trustNote": "Escrow-protected payments.",
    "login.trustNoteSub": "Your money is held securely and only released when you approve the completed work.",

    // ── Greetings ─────────────────────────────────────────────────────────────
    "greeting.morning": "Good morning",
    "greeting.afternoon": "Good afternoon",
    "greeting.evening": "Good evening",

    // ── Customer Home ────────────────────────────────────────────────────────
    "home.activeProject": "Active Project",
    "home.viewAll": "View all",
    "home.quickActions": "Quick Actions",
    "home.findContractors": "Find Contractors",
    "home.newProject": "New Project",
    "home.myProjects": "My Projects",
    "home.inEscrow": "In Escrow",
    "home.viewDetails": "View details",
    "home.approveCompletion": "✓ Review & Approve Completion",
    "home.activeProtected": "active project",
    "home.activeProtectedPlural": "active projects",
    "home.tvProtected": "TrustVibe protected",

    // ── Search / Explore ─────────────────────────────────────────────────────
    "search.title": "Find Contractors",
    "search.placeholder": "Search contractors or specialty...",
    "search.noResults": "No contractors found",
    "search.noResultsSub": "Try a different category or search term",
    "search.jobsCompleted": "jobs completed",
    "search.reviewsCount": "reviews",

    // ── Categories ───────────────────────────────────────────────────────────
    "category.all": "All",
    "category.bathroom": "Bathroom",
    "category.kitchen": "Kitchen",
    "category.painting": "Painting",
    "category.hvac": "HVAC",
    "category.carpentry": "Carpentry",
    "category.tiling": "Tiling",
    "category.plumbing": "Plumbing",
    "category.electrical": "Electrical",

    // ── Contractor Profile ───────────────────────────────────────────────────
    "profile.notFound": "Contractor not found.",
    "profile.jobs": "Jobs",
    "profile.response": "Response",
    "profile.score": "Score",
    "profile.hireViaEscrow": "Hire via Escrow",
    "profile.license": "License #",
    "profile.typicalResponse": "Typical response:",
    "profile.respondsQuickly": "This contractor responds quickly to new inquiries.",

    // ── My Projects ──────────────────────────────────────────────────────────
    "projects.title": "My Projects",
    "projects.empty": "No projects yet",
    "projects.emptySub": "Post your first project to start getting quotes from trusted contractors.",
    "projects.postProject": "Post a Project",
    "projects.budget": "Budget",
    "projects.quote": "quote",
    "projects.quotes": "quotes",

    // ── Project Detail ───────────────────────────────────────────────────────
    "detail.projectNotFound": "Project not found.",
    "detail.progress": "Project Progress",
    "detail.inProgress": "Work in progress — funds held securely in escrow",
    "detail.completionRequested": "Contractor has marked work as complete — please review and approve",
    "detail.description": "Description",
    "detail.photos": "Photos",
    "detail.selectedContractor": "Selected Contractor",
    "detail.agreedAmount": "Agreed amount",
    "detail.tvFee": "TrustVibe fee (7%)",
    "detail.contractorReceives": "Contractor receives",
    "detail.escrowNote": "Funds held in escrow — released on your approval",
    "detail.messageContractor": "Message Contractor",
    "detail.quotes": "Quotes",
    "detail.quoteAccepted": "✓ Quote Accepted",
    "detail.notSelected": "Not Selected",

    // ── Fund Escrow ──────────────────────────────────────────────────────────
    "fund.title": "Fund Escrow",
    "fund.success.title": "Escrow Funded!",
    "fund.success.sub": "is now held securely. The contractor has been notified and work can begin.",
    "fund.protected": "Your money is protected",
    "fund.protectedSub": "Funds will only be released when you explicitly approve the completed work. You are in full control.",
    "fund.viewProject": "View Project",
    "fund.summary": "Payment Summary",
    "fund.tvFee": "TrustVibe fee (7%)",
    "fund.escrowNote": "All funds held in secure escrow until you approve",
    "fund.guarantees": "Your Guarantees",
    "fund.paymentMethod": "Payment Method",
    "fund.cardEnding": "Visa ending in 4242",
    "fund.cardExpires": "Expires 08/27",
    "fund.processing": "Processing...",
    "fund.confirmBtn": "Confirm & Fund Escrow —",
    "fund.terms": "By confirming, you agree to TrustVibe's Escrow Terms and Payment Policy. Your money will be held securely and only released upon your explicit approval.",

    // ── Approve Release ──────────────────────────────────────────────────────
    "release.title": "Review Work",
    "release.workComplete": "✓ Work marked as complete",
    "release.completionPhotos": "Completion Photos",
    "release.escrowSummary": "Escrow Summary",
    "release.heldInEscrow": "Held in escrow",
    "release.releaseNote": "Once you approve, funds are released immediately to",
    "release.approveBtn": "Approve & Release",
    "release.issueBtn": "I Have an Issue with the Work",
    "release.issueNote": "If you have concerns, please raise an issue. TrustVibe will step in to help mediate. Funds will remain held until resolution.",
    "release.releasing": "Releasing...",
    "release.successTitle": "Payment Released! 🎉",
    "release.successSub": "has been released to",
    "release.fundsArrival": "Funds will arrive within 24 hours.",
    "release.backHome": "Back to Home",
    "release.issuedTitle": "Issue Reported",
    "release.issuedSub": "Funds remain held in escrow. TrustVibe will help mediate a resolution. You'll be contacted within 24 hours.",

    // ── Contractor Home ──────────────────────────────────────────────────────
    "chome.earningsOverview": "Earnings Overview",
    "chome.totalEarned": "Total earned (all time)",
    "chome.inEscrow": "In escrow",
    "chome.viewEarnings": "View all earnings →",
    "chome.noActiveJobs": "No active jobs right now",
    "chome.opportunities": "New Opportunities",
    "chome.browseAll": "Browse all",
    "chome.noProjects": "No open projects right now",
    "chome.rating": "rating",
    "chome.reliability": "reliability",

    // ── Browse Projects ──────────────────────────────────────────────────────
    "browse.title": "Browse Projects",
    "browse.available": "open project available",
    "browse.availablePlural": "open projects available",
    "browse.noProjects": "No open projects",
    "browse.noProjectsSub": "Check back later or try a different category.",
    "browse.youQuoted": "You quoted",
    "browse.viewQuote": "View & Quote →",

    // ── Project Bid ──────────────────────────────────────────────────────────
    "bid.title": "Submit Quote",
    "bid.notFound": "Project not found.",
    "bid.successTitle": "Quote Sent!",
    "bid.successSub": "Your quote for",
    "bid.successSub2": "has been submitted. You'll be notified if the customer accepts.",
    "bid.browseMore": "Browse More Projects",
    "bid.alreadyQuoted": "You Already Submitted a Quote",
    "bid.alreadyQuotedSub": "Amount:",
    "bid.timeline": "Timeline:",
    "bid.amount": "Total Quote Amount",
    "bid.breakdown": "Cost Breakdown",
    "bid.addItem": "Add item",
    "bid.itemPlaceholder": "Item description",
    "bid.breakdownTotal": "Breakdown total",
    "bid.timelineLabel": "Estimated Timeline",
    "bid.timelinePlaceholder": "e.g. 3–5 days, 2 weeks",
    "bid.notes": "Notes for the Customer",
    "bid.notesPlaceholder": "Describe your approach, experience, and anything that sets you apart...",
    "bid.terms": "Your quote will be reviewed by the customer. If accepted, a TrustVibe escrow agreement will be established.",
    "bid.submitBtn": "Submit Quote —",

    // ── My Jobs ──────────────────────────────────────────────────────────────
    "jobs.title": "My Jobs",
    "jobs.active": "Active Jobs",
    "jobs.noJobs": "No active jobs",
    "jobs.noJobsSub": "Accept a project to start earning.",
    "jobs.browseProjects": "Browse Projects",
    "jobs.pending": "Pending Quotes",
    "jobs.yourQuote": "Your quote",

    // ── Earnings ─────────────────────────────────────────────────────────────
    "earn.title": "Earnings",
    "earn.totalEarned": "Total Earned",
    "earn.afterFees": "After TrustVibe fees",
    "earn.inEscrow": "In Escrow",
    "earn.totalJobs": "Total Jobs",
    "earn.feesPaid": "Fees Paid",
    "earn.grossGmv": "Gross GMV",
    "earn.netRate": "Net Rate",
    "earn.history": "Payment History",
    "earn.fee": "Fee:",
    "earn.gross": "Gross:",

    // ── Admin ─────────────────────────────────────────────────────────────────
    "admin.title": "Admin Panel",
    "admin.administrator": "Administrator",
    "admin.logout": "Log out",
    "admin.totalEscrow": "Total in Escrow",
    "admin.platformWide": "Platform-wide funds under protection",
    "admin.viewProjects": "View All Projects",
    "admin.casesNav": "Dispute Cases",
    "admin.alert": "2 cases need attention",
    "admin.alertSub": "One dispute has been open for 15 days and requires admin review.",
    "admin.activityLog": "Activity Log",
    "admin.projects.title": "All Projects",
    "admin.projects.placeholder": "Search by title, location, or category...",
    "admin.projects.count": "projects",
    "admin.cases.title": "Dispute Cases",
    "admin.cases.open": "Open",
    "admin.cases.pending": "Pending",
    "admin.cases.resolved": "Resolved",
    "admin.cases.pendingResolution": "Pending Resolution",
    "admin.cases.days": "days",
    "admin.cases.inHold": "In hold",
    "admin.cases.summary": "Case Summary",
    "admin.cases.evidence": "Evidence on File",
    "admin.cases.adminNote": "Admin Note",
    "admin.cases.release": "✓ Release Funds",
    "admin.cases.refund": "↩ Full Refund",
    "admin.cases.split": "⚖️ Split",

    // ── Progress stepper ─────────────────────────────────────────────────────
    "step.posted": "Posted",
    "step.funded": "Funded",
    "step.working": "Working",
    "step.done": "Done",

    // ── TopBar ───────────────────────────────────────────────────────────────
    "btn.back": "Back",

    // ── Login demo chips ─────────────────────────────────────────────────────
    "login.customer": "Customer",
    "login.contractor": "Contractor",
    "login.admin": "Admin",

    // ── Browse ───────────────────────────────────────────────────────────────
    "browse.submitted": "submitted",

    // ── Customer Home activity ────────────────────────────────────────────────
    "activity.messageSent": "sent you a message about",
    "activity.escrowFunded": "Escrow funded —",
    "activity.heldSecurely": "held securely",
    "activity.quoteSubmitted": "submitted a quote for",

    // ── Additional status labels for Badge component ──────────────────────────
    "status.pending": "Pending",
    "status.accepted": "Accepted",
    "status.rejected": "Not Selected",
    "status.withdrawn": "Withdrawn",
    "status.paid": "Paid",
    "status.held": "In Escrow",

    // ── Admin activity log ────────────────────────────────────────────────────
    "admin.activity.escrowReleased": "Escrow released:",
    "admin.activity.toContractor": "to",
    "admin.activity.credentialRequest": "New credential verification request:",
    "admin.activity.licenseLabel": "License",
    "admin.activity.caseEscalated": "Case escalated:",
    "admin.activity.disputeInHold": "dispute —",
    "admin.activity.inHold": "in hold",
    "admin.activity.newContractor": "New contractor registered:",
    "admin.activity.newProjects": "new projects posted in San Juan this week",
    "admin.activity.hoursAgo": "hours ago",
    "admin.activity.dayAgo": "1 day ago",
    "admin.activity.daysAgo": "days ago",
    "admin.activity.solarQuote": "Solar Panel Installation quote submitted — 8 panels in Caguas (Carlos Vega, $7,200)",

    // ── Admin cases data ──────────────────────────────────────────────────────
    "case1.title": "Exterior House Painting",
    "case1.customer": "David Colón",
    "case1.contractor": "Paintmaster PR",
    "case1.description": "Customer reports contractor did not apply a second coat as agreed. Contractor claims it was never specified in the agreement. Both parties are requesting mediation.",
    "case1.evidence1": "Customer photo of incomplete wall",
    "case1.evidence2": "Original quote document",
    "case2.title": "HVAC Repair — Office Unit",
    "case2.customer": "Carmen Rios (Property Manager)",
    "case2.contractor": "CoolAir PR",
    "case2.description": "HVAC unit failed again 3 days after repair. Customer is requesting full refund. Contractor claims it was a different component that failed.",
    "case2.evidence1": "Service receipt",
    "case2.evidence2": "Customer video of unit",
    "case2.evidence3": "Contractor diagnostic report",
    "case2.resolution": "Admin proposed 50% refund pending contractor review.",

    // ── New Project screen ────────────────────────────────────────────────────
    "newProject.title": "New Project",
    "newProject.projectTitle": "Project Title",
    "newProject.titlePlaceholder": "e.g. Bathroom Renovation",
    "newProject.description": "Description",
    "newProject.descriptionPlaceholder": "Describe the work you need done...",
    "newProject.category": "Category",
    "newProject.selectCategory": "Select a category",
    "newProject.budget": "Budget Range",
    "newProject.budgetPlaceholder": "e.g. $1,000 – $2,500",
    "newProject.timeline": "Timeline",
    "newProject.timelinePlaceholder": "e.g. 2–3 weeks",
    "newProject.location": "Location",
    "newProject.locationPlaceholder": "e.g. San Juan, PR",
    "newProject.submit": "Post Project",
    "newProject.posting": "Posting...",
    "newProject.success": "Project Posted!",
    "newProject.successSub": "Contractors can now view your project and submit quotes.",
    "newProject.viewProject": "View My Project",
    "newProject.viewAll": "View All My Projects",
    "newProject.contractorLinked": "Contractor linked — they'll be notified of your new project.",
    "newProject.preLinked": "Pre-linked contractor:",
  },

  es: {
    // ── Navigation ──────────────────────────────────────────────────────────
    "nav.home": "Inicio",
    "nav.explore": "Explorar",
    "nav.projects": "Proyectos",
    "nav.messages": "Mensajes",
    "nav.browse": "Buscar",
    "nav.jobs": "Mis Trabajos",
    "nav.earnings": "Ganancias",
    "nav.dashboard": "Panel",
    "nav.cases": "Casos",

    // ── Trust ───────────────────────────────────────────────────────────────
    "trust.tagline": "Tu dinero está protegido hasta que apruebes",
    "trust.subtitle": "TrustVibe retiene los fondos de forma segura — liberados solo cuando confirmas que el trabajo está terminado.",

    // ── Buttons ─────────────────────────────────────────────────────────────
    "btn.fundEscrow": "Fondear Escrow",
    "btn.approveRelease": "Aprobar y Liberar",
    "btn.submitQuote": "Enviar Cotización",
    "btn.raiseIssue": "Reportar un Problema",
    "btn.leaveReview": "Dejar Reseña",
    "btn.submitReview": "Enviar Reseña",
    "btn.viewProject": "Ver Proyecto",
    "btn.acceptQuote": "Aceptar Esta Cotización",
    "btn.signIn": "Iniciar Sesión",
    "btn.viewProfile": "Ver Perfil",
    "btn.sendMessage": "Enviar Mensaje",
    "btn.backHome": "Volver al Inicio",

    // ── Status labels ────────────────────────────────────────────────────────
    "status.draft": "Borrador",
    "status.open": "Abierto para Cotizar",
    "status.funded": "Fondeado",
    "status.in_progress": "En Progreso",
    "status.complete_requested": "Finalización Solicitada",
    "status.completed": "Completado",
    "status.disputed": "En Disputa",

    // ── Generic labels ───────────────────────────────────────────────────────
    "label.rating": "Calificación",
    "label.jobs": "Trabajos",
    "label.response": "Respuesta",
    "label.verified": "Verificado",
    "label.escrow": "En Escrow",
    "label.earned": "Ganado",
    "label.fee": "Comisión TrustVibe",
    "label.youReceive": "Tú recibes",
    "label.totalCharged": "Total cobrado",
    "label.activeJobs": "Trabajos Activos",
    "label.pendingQuotes": "Cotizaciones Pendientes",
    "label.recentActivity": "Actividad Reciente",
    "label.portfolio": "Portafolio",
    "label.reviews": "Reseñas",
    "label.about": "Acerca de",
    "label.badges": "Insignias de Confianza",
    "label.budget": "Presupuesto",
    "label.viewAll": "Ver todo",

    // ── Messages ─────────────────────────────────────────────────────────────
    "msg.placeholder": "Escribe un mensaje...",
    "msg.send": "Enviar",
    "msg.empty": "Sin mensajes aún",
    "msg.emptySub": "Acepta una cotización para comenzar a chatear con tu contratista.",
    "msg.startConversation": "Envía el primer mensaje para comenzar.",

    // ── Review ───────────────────────────────────────────────────────────────
    "review.title": "Califica tu experiencia",
    "review.placeholder": "Cuéntale a otros sobre tu experiencia...",
    "review.success": "¡Gracias por tu reseña!",
    "review.backHome": "Volver al Inicio",
    "review.findMore": "Buscar Más Contratistas",
    "review.successSub": "Tu reseña ayuda a otros propietarios a tomar mejores decisiones. ¡Gracias por usar TrustVibe!",
    "review.whatsStoodOut": "¿Qué destacó?",
    "review.publicNote": "Tu reseña es pública y ayuda a otros propietarios a encontrar contratistas confiables.",
    "review.starPrompt": "Toca una estrella para calificar",
    "review.star1": "No satisfecho",
    "review.star2": "Por debajo de lo esperado",
    "review.star3": "Estuvo bien",
    "review.star4": "¡Gran experiencia!",
    "review.star5": "¡Excelente! 🎉",

    // ── Review tags ──────────────────────────────────────────────────────────
    "tag.onTime": "Puntual",
    "tag.cleanWork": "Trabajo Limpio",
    "tag.professional": "Profesional",
    "tag.fairPrice": "Precio Justo",
    "tag.communicative": "Comunicativo",
    "tag.qualityWork": "Trabajo de Calidad",
    "tag.wouldHireAgain": "Lo Contrataría Otra Vez",
    "tag.fast": "Rápido",
    "tag.detailOriented": "Detallista",

    // ── Escrow callout ───────────────────────────────────────────────────────
    "escrow.protected": "Protección Escrow TrustVibe",
    "escrow.protected.sub": "Tu dinero está retenido de forma segura hasta que apruebes el trabajo.",
    "escrow.guarantee1": "Dinero retenido hasta que TÚ apruebes el trabajo completado",
    "escrow.guarantee2": "Reembolso completo si el contratista no comienza en el tiempo acordado",
    "escrow.guarantee3": "Resolución de disputas incluida sin costo adicional",
    "escrow.guarantee4": "Fondos liberados solo con tu confirmación explícita",

    // ── Login ─────────────────────────────────────────────────────────────────
    "login.welcome": "Bienvenido de vuelta",
    "login.tagline": "Paga de forma segura por servicios del hogar en Puerto Rico",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.demo": "Probar cuenta demo",
    "login.error": "Correo o contraseña inválidos. Inténtalo de nuevo.",
    "login.signingIn": "Iniciando sesión...",
    "login.trustNote": "Pagos protegidos por escrow.",
    "login.trustNoteSub": "Tu dinero se retiene de forma segura y solo se libera cuando apruebas el trabajo completado.",

    // ── Greetings ─────────────────────────────────────────────────────────────
    "greeting.morning": "Buenos días",
    "greeting.afternoon": "Buenas tardes",
    "greeting.evening": "Buenas noches",

    // ── Customer Home ────────────────────────────────────────────────────────
    "home.activeProject": "Proyecto Activo",
    "home.viewAll": "Ver todo",
    "home.quickActions": "Acciones Rápidas",
    "home.findContractors": "Buscar Contratistas",
    "home.newProject": "Nuevo Proyecto",
    "home.myProjects": "Mis Proyectos",
    "home.inEscrow": "En Escrow",
    "home.viewDetails": "Ver detalles",
    "home.approveCompletion": "✓ Revisar y Aprobar Finalización",
    "home.activeProtected": "proyecto activo",
    "home.activeProtectedPlural": "proyectos activos",
    "home.tvProtected": "protegido por TrustVibe",

    // ── Search / Explore ─────────────────────────────────────────────────────
    "search.title": "Buscar Contratistas",
    "search.placeholder": "Busca contratistas o especialidad...",
    "search.noResults": "No se encontraron contratistas",
    "search.noResultsSub": "Prueba una categoría o término de búsqueda diferente",
    "search.jobsCompleted": "trabajos completados",
    "search.reviewsCount": "reseñas",

    // ── Categories ───────────────────────────────────────────────────────────
    "category.all": "Todos",
    "category.bathroom": "Baño",
    "category.kitchen": "Cocina",
    "category.painting": "Pintura",
    "category.hvac": "A/C",
    "category.carpentry": "Carpintería",
    "category.tiling": "Azulejos",
    "category.plumbing": "Plomería",
    "category.electrical": "Electricidad",

    // ── Contractor Profile ───────────────────────────────────────────────────
    "profile.notFound": "Contratista no encontrado.",
    "profile.jobs": "Trabajos",
    "profile.response": "Respuesta",
    "profile.score": "Puntaje",
    "profile.hireViaEscrow": "Contratar vía Escrow",
    "profile.license": "Licencia #",
    "profile.typicalResponse": "Respuesta típica:",
    "profile.respondsQuickly": "Este contratista responde rápidamente a nuevas consultas.",

    // ── My Projects ──────────────────────────────────────────────────────────
    "projects.title": "Mis Proyectos",
    "projects.empty": "Sin proyectos aún",
    "projects.emptySub": "Publica tu primer proyecto para comenzar a recibir cotizaciones de contratistas confiables.",
    "projects.postProject": "Publicar un Proyecto",
    "projects.budget": "Presupuesto",
    "projects.quote": "cotización",
    "projects.quotes": "cotizaciones",

    // ── Project Detail ───────────────────────────────────────────────────────
    "detail.projectNotFound": "Proyecto no encontrado.",
    "detail.progress": "Progreso del Proyecto",
    "detail.inProgress": "Trabajo en progreso — fondos retenidos de forma segura en escrow",
    "detail.completionRequested": "El contratista marcó el trabajo como completo — por favor revisa y aprueba",
    "detail.description": "Descripción",
    "detail.photos": "Fotos",
    "detail.selectedContractor": "Contratista Seleccionado",
    "detail.agreedAmount": "Monto acordado",
    "detail.tvFee": "Comisión TrustVibe (7%)",
    "detail.contractorReceives": "El contratista recibe",
    "detail.escrowNote": "Fondos en escrow — liberados con tu aprobación",
    "detail.messageContractor": "Mensaje al Contratista",
    "detail.quotes": "Cotizaciones",
    "detail.quoteAccepted": "✓ Cotización Aceptada",
    "detail.notSelected": "No Seleccionada",

    // ── Fund Escrow ──────────────────────────────────────────────────────────
    "fund.title": "Fondear Escrow",
    "fund.success.title": "¡Escrow Fondeado!",
    "fund.success.sub": "está ahora retenido de forma segura. El contratista ha sido notificado y el trabajo puede comenzar.",
    "fund.protected": "Tu dinero está protegido",
    "fund.protectedSub": "Los fondos solo se liberarán cuando apruebes explícitamente el trabajo completado. Tú tienes el control total.",
    "fund.viewProject": "Ver Proyecto",
    "fund.summary": "Resumen de Pago",
    "fund.tvFee": "Comisión TrustVibe (7%)",
    "fund.escrowNote": "Todos los fondos retenidos en escrow seguro hasta que apruebes",
    "fund.guarantees": "Tus Garantías",
    "fund.paymentMethod": "Método de Pago",
    "fund.cardEnding": "Visa que termina en 4242",
    "fund.cardExpires": "Vence 08/27",
    "fund.processing": "Procesando...",
    "fund.confirmBtn": "Confirmar y Fondear Escrow —",
    "fund.terms": "Al confirmar, aceptas los Términos de Escrow y la Política de Pago de TrustVibe. Tu dinero se retendrá de forma segura y solo se liberará con tu aprobación explícita.",

    // ── Approve Release ──────────────────────────────────────────────────────
    "release.title": "Revisar Trabajo",
    "release.workComplete": "✓ Trabajo marcado como completo",
    "release.completionPhotos": "Fotos de Finalización",
    "release.escrowSummary": "Resumen de Escrow",
    "release.heldInEscrow": "Retenido en escrow",
    "release.releaseNote": "Una vez que apruebes, los fondos se liberan inmediatamente a",
    "release.approveBtn": "Aprobar y Liberar",
    "release.issueBtn": "Tengo un Problema con el Trabajo",
    "release.issueNote": "Si tienes inquietudes, reporta un problema. TrustVibe intervendrá para mediar. Los fondos permanecerán retenidos hasta la resolución.",
    "release.releasing": "Liberando...",
    "release.successTitle": "¡Pago Liberado! 🎉",
    "release.successSub": "ha sido liberado a",
    "release.fundsArrival": "Los fondos llegarán dentro de 24 horas.",
    "release.backHome": "Volver al Inicio",
    "release.issuedTitle": "Problema Reportado",
    "release.issuedSub": "Los fondos permanecen en escrow. TrustVibe ayudará a mediar una resolución. Serás contactado en 24 horas.",

    // ── Contractor Home ──────────────────────────────────────────────────────
    "chome.earningsOverview": "Resumen de Ganancias",
    "chome.totalEarned": "Total ganado (todos los tiempos)",
    "chome.inEscrow": "En escrow",
    "chome.viewEarnings": "Ver todas las ganancias →",
    "chome.noActiveJobs": "Sin trabajos activos en este momento",
    "chome.opportunities": "Nuevas Oportunidades",
    "chome.browseAll": "Ver todas",
    "chome.noProjects": "Sin proyectos abiertos en este momento",
    "chome.rating": "calificación",
    "chome.reliability": "confiabilidad",

    // ── Browse Projects ──────────────────────────────────────────────────────
    "browse.title": "Buscar Proyectos",
    "browse.available": "proyecto abierto disponible",
    "browse.availablePlural": "proyectos abiertos disponibles",
    "browse.noProjects": "Sin proyectos abiertos",
    "browse.noProjectsSub": "Vuelve más tarde o prueba una categoría diferente.",
    "browse.youQuoted": "Ya cotizaste",
    "browse.viewQuote": "Ver y Cotizar →",

    // ── Project Bid ──────────────────────────────────────────────────────────
    "bid.title": "Enviar Cotización",
    "bid.notFound": "Proyecto no encontrado.",
    "bid.successTitle": "¡Cotización Enviada!",
    "bid.successSub": "Tu cotización para",
    "bid.successSub2": "ha sido enviada. Serás notificado si el cliente la acepta.",
    "bid.browseMore": "Ver Más Proyectos",
    "bid.alreadyQuoted": "Ya Enviaste una Cotización",
    "bid.alreadyQuotedSub": "Monto:",
    "bid.timeline": "Plazo:",
    "bid.amount": "Monto Total de Cotización",
    "bid.breakdown": "Desglose de Costos",
    "bid.addItem": "Agregar ítem",
    "bid.itemPlaceholder": "Descripción del ítem",
    "bid.breakdownTotal": "Total del desglose",
    "bid.timelineLabel": "Plazo Estimado",
    "bid.timelinePlaceholder": "ej. 3–5 días, 2 semanas",
    "bid.notes": "Notas para el Cliente",
    "bid.notesPlaceholder": "Describe tu enfoque, experiencia y lo que te diferencia...",
    "bid.terms": "Tu cotización será revisada por el cliente. Si es aceptada, se establecerá un acuerdo de escrow con TrustVibe.",
    "bid.submitBtn": "Enviar Cotización —",

    // ── My Jobs ──────────────────────────────────────────────────────────────
    "jobs.title": "Mis Trabajos",
    "jobs.active": "Trabajos Activos",
    "jobs.noJobs": "Sin trabajos activos",
    "jobs.noJobsSub": "Acepta un proyecto para comenzar a ganar.",
    "jobs.browseProjects": "Ver Proyectos",
    "jobs.pending": "Cotizaciones Pendientes",
    "jobs.yourQuote": "Tu cotización",

    // ── Earnings ─────────────────────────────────────────────────────────────
    "earn.title": "Ganancias",
    "earn.totalEarned": "Total Ganado",
    "earn.afterFees": "Después de comisiones TrustVibe",
    "earn.inEscrow": "En Escrow",
    "earn.totalJobs": "Total de Trabajos",
    "earn.feesPaid": "Comisiones Pagadas",
    "earn.grossGmv": "GMV Bruto",
    "earn.netRate": "Tasa Neta",
    "earn.history": "Historial de Pagos",
    "earn.fee": "Comisión:",
    "earn.gross": "Bruto:",

    // ── Admin ─────────────────────────────────────────────────────────────────
    "admin.title": "Panel de Administración",
    "admin.administrator": "Administrador",
    "admin.logout": "Cerrar sesión",
    "admin.totalEscrow": "Total en Escrow",
    "admin.platformWide": "Fondos de la plataforma bajo protección",
    "admin.viewProjects": "Ver Todos los Proyectos",
    "admin.casesNav": "Casos de Disputa",
    "admin.alert": "2 casos necesitan atención",
    "admin.alertSub": "Una disputa lleva 15 días abierta y requiere revisión del administrador.",
    "admin.activityLog": "Registro de Actividad",
    "admin.projects.title": "Todos los Proyectos",
    "admin.projects.placeholder": "Buscar por título, ubicación o categoría...",
    "admin.projects.count": "proyectos",
    "admin.cases.title": "Casos de Disputa",
    "admin.cases.open": "Abierto",
    "admin.cases.pending": "Pendiente",
    "admin.cases.resolved": "Resuelto",
    "admin.cases.pendingResolution": "Resolución Pendiente",
    "admin.cases.days": "días",
    "admin.cases.inHold": "En retención",
    "admin.cases.summary": "Resumen del Caso",
    "admin.cases.evidence": "Evidencia Registrada",
    "admin.cases.adminNote": "Nota del Administrador",
    "admin.cases.release": "✓ Liberar Fondos",
    "admin.cases.refund": "↩ Reembolso Total",
    "admin.cases.split": "⚖️ Dividir",

    // ── Progress stepper ─────────────────────────────────────────────────────
    "step.posted": "Publicado",
    "step.funded": "Fondeado",
    "step.working": "En Proceso",
    "step.done": "Listo",

    // ── TopBar ───────────────────────────────────────────────────────────────
    "btn.back": "Atrás",

    // ── Login demo chips ─────────────────────────────────────────────────────
    "login.customer": "Cliente",
    "login.contractor": "Contratista",
    "login.admin": "Admin",

    // ── Browse ───────────────────────────────────────────────────────────────
    "browse.submitted": "enviadas",

    // ── Customer Home activity ────────────────────────────────────────────────
    "activity.messageSent": "te envió un mensaje sobre",
    "activity.escrowFunded": "Escrow fondeado —",
    "activity.heldSecurely": "retenido de forma segura",
    "activity.quoteSubmitted": "envió una cotización para",

    // ── Additional status labels for Badge component ──────────────────────────
    "status.pending": "Pendiente",
    "status.accepted": "Aceptada",
    "status.rejected": "No Seleccionada",
    "status.withdrawn": "Retirada",
    "status.paid": "Pagado",
    "status.held": "En Escrow",

    // ── Admin activity log ────────────────────────────────────────────────────
    "admin.activity.escrowReleased": "Escrow liberado:",
    "admin.activity.toContractor": "a",
    "admin.activity.credentialRequest": "Nueva solicitud de verificación:",
    "admin.activity.licenseLabel": "Licencia",
    "admin.activity.caseEscalated": "Caso escalado:",
    "admin.activity.disputeInHold": "disputa —",
    "admin.activity.inHold": "en retención",
    "admin.activity.newContractor": "Nuevo contratista registrado:",
    "admin.activity.newProjects": "nuevos proyectos publicados en San Juan esta semana",
    "admin.activity.hoursAgo": "horas",
    "admin.activity.dayAgo": "hace 1 día",
    "admin.activity.daysAgo": "días",
    "admin.activity.solarQuote": "Cotización de instalación solar enviada — 8 paneles en Caguas (Carlos Vega, $7,200)",

    // ── Admin cases data ──────────────────────────────────────────────────────
    "case1.title": "Pintura Exterior de Casa",
    "case1.customer": "David Colón",
    "case1.contractor": "Paintmaster PR",
    "case1.description": "El cliente reporta que el contratista no aplicó una segunda capa como se acordó. El contratista alega que nunca se especificó en el acuerdo. Ambas partes solicitan mediación.",
    "case1.evidence1": "Foto del cliente de pared incompleta",
    "case1.evidence2": "Documento de cotización original",
    "case2.title": "Reparación HVAC — Unidad de Oficina",
    "case2.customer": "Carmen Rios (Administradora de Propiedad)",
    "case2.contractor": "CoolAir PR",
    "case2.description": "La unidad HVAC falló nuevamente 3 días después de la reparación. El cliente solicita reembolso completo. El contratista alega que fue un componente diferente que falló.",
    "case2.evidence1": "Recibo de servicio",
    "case2.evidence2": "Video del cliente de la unidad",
    "case2.evidence3": "Informe de diagnóstico del contratista",
    "case2.resolution": "Admin propuso reembolso del 50% pendiente de revisión del contratista.",

    // ── New Project screen ────────────────────────────────────────────────────
    "newProject.title": "Nuevo Proyecto",
    "newProject.projectTitle": "Título del Proyecto",
    "newProject.titlePlaceholder": "ej. Renovación de Baño",
    "newProject.description": "Descripción",
    "newProject.descriptionPlaceholder": "Describe el trabajo que necesitas...",
    "newProject.category": "Categoría",
    "newProject.selectCategory": "Selecciona una categoría",
    "newProject.budget": "Rango de Presupuesto",
    "newProject.budgetPlaceholder": "ej. $1,000 – $2,500",
    "newProject.timeline": "Plazo",
    "newProject.timelinePlaceholder": "ej. 2–3 semanas",
    "newProject.location": "Ubicación",
    "newProject.locationPlaceholder": "ej. San Juan, PR",
    "newProject.submit": "Publicar Proyecto",
    "newProject.posting": "Publicando...",
    "newProject.success": "¡Proyecto Publicado!",
    "newProject.successSub": "Los contratistas ahora pueden ver tu proyecto y enviar cotizaciones.",
    "newProject.viewProject": "Ver Mi Proyecto",
    "newProject.viewAll": "Ver Todos Mis Proyectos",
    "newProject.contractorLinked": "Contratista vinculado — será notificado de tu nuevo proyecto.",
    "newProject.preLinked": "Contratista pre-vinculado:",
  },
};

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: string, fallback?: string): string => {
    return translations[lang][key] ?? fallback ?? key;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
