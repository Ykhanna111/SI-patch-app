import { SiLinkedin, SiInstagram } from "react-icons/si";
import { Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              <span className="text-xl font-bold bg-gradient-to-r from-sudoku-primary to-sudoku-accent bg-clip-text text-transparent">
                Sudoku Infinium
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              A product of Meta Infinium. Bringing the best puzzle experiences to your screen.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact Us</h4>
            <div className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors">
              <Mail className="h-4 w-4" />
              <a href="mailto:metainfinium@gmail.com" className="text-sm">
                metainfinium@gmail.com
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Connect With Us</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://www.metainfinium.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">Website</span>
              </a>
              <a 
                href="https://www.linkedin.com/company/meta-infinium/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <SiLinkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a 
                href="https://www.instagram.com/metainfinium/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <SiInstagram className="h-4 w-4" />
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 META INFINIUM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
