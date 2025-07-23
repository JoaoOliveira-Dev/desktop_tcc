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
  Settings2,
  BookOpen,
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
      title: "API's de testes",
      url: "/api",
      icon: GitPullRequestArrow,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Listas",
      url: "#",
      icon: ScrollText,
      items: [
        {
          title: "Google dorks",
          url: "#",
        },
        {
          title: "XSS",
          url: "#",
        },
        {
          title: "403 BYPASS",
          url: "#",
        },
        {
          title: "SQLi",
          url: "#",
        },
        {
          title: "LFI",
          url: "#",
        },
        {
          title: "RCE",
          url: "#",
        },
        {
          title: "XXE",
          url: "#",
        },
        {
          title: "SSRF",
          url: "#",
        },
        {
          title: "SSTI",
          url: "#",
        },
      ],
    },
    {
      title: "Encoder/Decoder",
      url: "/encoder-decoder",
      icon: Pi,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
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
