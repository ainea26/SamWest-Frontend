// "use client";

// import { useRouter } from "next/navigation";
// import {
//   ArrowRight,
//   BadgePercent,
//   MessageCircle,
//   Search,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";
// import { useState, type FormEvent } from "react";

// import Container from "@/components/ui/Container";

// export default function HeroSection() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");

//   function handleSearch(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const query = searchQuery.trim();

//     if (!query) {
//       router.push("/products");
//       return;
//     }

//     router.push(`/products?search=${encodeURIComponent(query)}`);
//   }

//   return (
//     <section className="relative overflow-hidden bg-slate-950 text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.28),transparent_42%)]" />
//       <div className="absolute -left-28 bottom-0 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />

//       <Container className="relative grid min-h-140 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
//         <div>
//           <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-extrabold text-amber-300">
//             <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
//             Smart shopping with SamWest
//           </div>

//           <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
//             Everyday products,
//             <span className="block text-amber-400">better prices.</span>
//           </h1>

//           <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
//             Browse selected groceries, household essentials, electronics and
//             more. Add what you need and send your booking through WhatsApp for
//             confirmation.
//           </p>

//           <form onSubmit={handleSearch} className="relative mt-8 max-w-2xl">
//             <label htmlFor="hero-search" className="sr-only">
//               Search SamWest products
//             </label>

//             <Search
//               className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
//               aria-hidden="true"
//             />

//             <input
//               id="hero-search"
//               type="search"
//               value={searchQuery}
//               onChange={(event) => setSearchQuery(event.target.value)}
//               placeholder="What are you looking for?"
//               className="h-15 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-28 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 sm:pr-36"
//             />

//             <button
//               type="submit"
//               className="absolute right-1.5 top-1/2 flex h-12 -translate-y-1/2 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-extrabold text-white transition hover:bg-amber-700 sm:px-6 sm:text-sm"
//             >
//               Search
//               <ArrowRight
//                 className="hidden h-4 w-4 sm:block"
//                 aria-hidden="true"
//               />
//             </button>
//           </form>

//           <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-300 sm:text-sm">
//             <span className="inline-flex items-center gap-2">
//               <BadgePercent
//                 className="h-4 w-4 text-amber-400"
//                 aria-hidden="true"
//               />
//               Save 20% on selected products
//             </span>

//             <span className="inline-flex items-center gap-2">
//               <ShieldCheck
//                 className="h-4 w-4 text-amber-400"
//                 aria-hidden="true"
//               />
//               Availability confirmed before fulfilment
//             </span>
//           </div>
//         </div>

//         <div className="relative hidden lg:block">
//           <div className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
//             <div className="rounded-3xl bg-white p-7 text-slate-950">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">
//                     How SamWest works
//                   </p>

//                   <h2 className="mt-2 text-2xl font-black">
//                     Simple WhatsApp booking
//                   </h2>
//                 </div>

//                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
//                   <MessageCircle className="h-6 w-6" aria-hidden="true" />
//                 </div>
//               </div>

//               <div className="mt-7 space-y-4">
//                 {[
//                   {
//                     number: "01",
//                     title: "Browse products",
//                     description: "Explore our selected categories and offers.",
//                   },
//                   {
//                     number: "02",
//                     title: "Build your booking",
//                     description: "Choose your products and quantities.",
//                   },
//                   {
//                     number: "03",
//                     title: "Confirm through WhatsApp",
//                     description:
//                       "Send the list and wait for our confirmation call.",
//                   },
//                 ].map((step) => (
//                   <div
//                     key={step.number}
//                     className="flex gap-4 rounded-2xl bg-slate-50 p-4"
//                   >
//                     <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xs font-black text-amber-800">
//                       {step.number}
//                     </span>

//                     <div>
//                       <h3 className="text-sm font-black">{step.title}</h3>

//                       <p className="mt-1 text-xs leading-5 text-slate-500">
//                         {step.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </Container>
//     </section>
//   );
// }
