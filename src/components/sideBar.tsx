import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  Pi,
  ScrollText ,
  GitPullRequestArrow,
  GalleryVerticalEnd,
  CodeXml,
  SquareTerminal,
  Bot,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { ThemeSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMains: [
    {
      title: "Notes",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Reports",
          url: "/report",
        },
        {
          title: "API's",
          url: "/api",
          icon: Frame,
        },
      ],
    },
  ],
  navMain: [

    {
      title: "Listas",
      url: "/listas",
      icon: ScrollText,
      items: [
        {
          title: "Todas as listas",
          url: "/listas",
        },
        {
          title: "Google dorks",
          url: "/listas/google-dorks",
        },
        {
          title: "Links",
          url: "/listas/links",
        },
        {
          title: "Recon",
          url: "/listas/recon",
        },
        {
          title: "Wordlists",
          url: "/listas/wordlists",
        },
        {
          title: "Checklists",
          url: "/listas/checklists",
        },
        {
          title: "XSS",
          url: "/xss",
        },
        {
          title: "CSRF",
          url: "/csrf",
        },
        {
          title: "Click Jacking",
          url: "/clickjacking",
        },
        {
          title: "403 BYPASS",
          url: "/forbiden-bypass",
        },
        {
          title: "SQLi",
          url: "/listas/sqli",
        },
        {
          title: "LFI",
          url: "/listas/lfi",
        },
        {
          title: "RCE",
          url: "/listas/rce",
        },
        {
          title: "Subdomain Takeover",
          url: "/subdomain-takeover",
        },
        {
          title: "XXE",
          url: "/listas/xxe",
        },
        {
          title: "SSRF",
          url: "/listas/ssrf",
        },
        {
          title: "SSTI",
          url: "/listas/ssti",
        },
        {
          title: "Pós-exploração",
          url: "/listas/post-exploitation",
        },
        {
          title: "Labs",
          url: "/listas/labs",
        },
      ],
    },
  ],

  teste: [
    {
      name: "Gerador de payloads",
      url: "/payload-generator",
      icon: CodeXml ,
    },
    {
      name: "API's de testes",
      url: "#",
      icon: GitPullRequestArrow ,
    },
    {
      name: "Listas",
      url: "#",
      icon: ScrollText ,
    },
    {
      name: "Encoder/Decoder",
      url: "/encoder-decoder",
      icon: Pi,
    },
    {
      name: "Relatório com IA",
      url: "/ai-report-generator",
      icon: Bot,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
