"use client";
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Twitter,
    Dribbble,
    Globe,
} from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "./ui/hover-footer";

function HoverFooter() {
    // Footer link data
    const footerLinks = [
        {
            title: "About Us",
            links: [
                { label: "Company History", href: "#" },
                { label: "Meet the Team", href: "#" },
                { label: "Employee Handbook", href: "#" },
                { label: "Careers", href: "#" },
            ],
        },
        {
            title: "Helpful Links",
            links: [
                { label: "FAQs", href: "#" },
                { label: "Support", href: "#" },
                {
                    label: "Live Chat",
                    href: "#",
                    pulse: true,
                },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={18} className="text-primary" />,
            text: "hello@timemap.com",
            href: "mailto:hello@timemap.com",
        },
        {
            icon: <Phone size={18} className="text-primary" />,
            text: "+1 (555) 123-4567",
            href: "tel:+15551234567",
        },
        {
            icon: <MapPin size={18} className="text-primary" />,
            text: "San Francisco, CA",
        },
    ];

    // Social media icons
    const socialLinks = [
        { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
        { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
        { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
        { icon: <Dribbble size={20} />, label: "Dribbble", href: "#" },
        { icon: <Globe size={20} />, label: "Globe", href: "#" },
    ];

    return (
        <footer className="bg-card/30 relative h-fit rounded-t-3xl overflow-hidden mt-10 w-full border-t border-white/5">
            <div className="max-w-7xl mx-auto p-14 z-40 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
                    {/* Brand section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-foreground text-3xl font-bold">TimeMap</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            TimeMap is the ultimate productivity tool for high achievers.
                        </p>
                    </div>

                    {/* Footer link sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-foreground text-lg font-semibold mb-6">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label} className="relative">
                                        <a
                                            href={link.href}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                        {link.pulse && (
                                            <span className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact section */}
                    <div>
                        <h4 className="text-foreground text-lg font-semibold mb-6">
                            Contact Us
                        </h4>
                        <ul className="space-y-4">
                            {contactInfo.map((item, i) => (
                                <li key={i} className="flex items-center space-x-3">
                                    {item.icon}
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground hover:text-primary transition-colors">
                                            {item.text}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="border-t border-white/10 my-8" />

                {/* Footer bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 text-muted-foreground">
                    {/* Social icons */}
                    <div className="flex space-x-6">
                        {socialLinks.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="hover:text-primary transition-colors"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-center md:text-left text-muted-foreground">
                        &copy; {new Date().getFullYear()} TimeMap. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Text hover effect */}
            <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36 justify-center items-center pointer-events-none">
                <div className="pointer-events-auto w-full">
                    <TextHoverEffect text="TIMEMAP" className="z-50" />
                </div>
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}

export default HoverFooter;
