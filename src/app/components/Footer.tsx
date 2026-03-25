import { Link } from "react-router";
import { Leaf, Twitter, Instagram, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0F3D2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#2F8F6B] rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-[Manrope] font-bold text-xl text-white">
                Skill<span className="text-[#6DD4A8]">Seed</span>
              </span>
            </div>
            <p className="text-[#A8D5BF] text-sm leading-relaxed">
              Connecting climate skills with real-world missions. Learn, act, and grow together.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2F8F6B] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2F8F6B] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2F8F6B] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2F8F6B] transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-[Manrope]">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Mission Dashboard", to: "/dashboard" },
                { label: "Post a Project", to: "/post-project" },
                { label: "Progress Tracker", to: "/progress" },
                { label: "Community", to: "/community" },
                { label: "Funding Resources", to: "/funding" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#A8D5BF] text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Missions */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-[Manrope]">Mission Types</h4>
            <ul className="space-y-2 text-[#A8D5BF] text-sm">
              {["Urban Gardening", "Composting", "Repair & Reuse", "Energy Saving", "Reforestation", "Marine Conservation"].map((item) => (
                <li key={item}>
                  <Link to="/dashboard" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-[Manrope]">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About SkillSeed", to: "/" },
                { label: "Privacy Policy", to: "/" },
                { label: "Terms of Service", to: "/" },
                { label: "Contact Us", to: "/" },
                { label: "Verifier Portal", to: "/verifier-login" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#A8D5BF] text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 text-[#A8D5BF] text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:hello@skillseed.earth" className="hover:text-white transition-colors">
                hello@skillseed.earth
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#A8D5BF] text-xs">
            © 2026 SkillSeed. Made with 🌱 for a greener planet.
          </p>
          <p className="text-[#A8D5BF] text-xs">
            Climate skills platform · Connecting people with purpose
          </p>
        </div>
      </div>
    </footer>
  );
}
