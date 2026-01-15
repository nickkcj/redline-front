'use client'

import * as React from 'react'
import { Link, File, Image, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useWorkspaceStore } from '@/store/workspace-store'

export function SidebarRight() {
  const { sidebarRightOpen, toggleSidebarRight } = useWorkspaceStore()

  if (!sidebarRightOpen) return null

  return (
    <div className="flex h-full w-72 flex-col border-l bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Context & Resources</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleSidebarRight}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Related Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Related Links</h4>
            <div className="space-y-0.5">
              <a href="#" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted text-sm text-foreground hover:underline">
                <Link className="h-3 w-3" />
                <span>Project Documentation</span>
              </a>
              <a href="#" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted text-sm text-foreground hover:underline">
                <Link className="h-3 w-3" />
                <span>Figma Designs</span>
              </a>
            </div>
          </div>

          <Separator />

          {/* Referenced Docs */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">References</h4>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted text-sm">
                <File className="h-3 w-3 text-muted-foreground" />
                <span>PRD_v1.0.pdf</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted text-sm">
                <File className="h-3 w-3 text-muted-foreground" />
                <span>Architecture_Diagram.png</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Media */}
          <div className="space-y-2">
             <h4 className="text-xs font-semibold text-muted-foreground uppercase">Media</h4>
             <div className="grid grid-cols-2 gap-2">
               <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                 <Image className="h-4 w-4 text-muted-foreground" />
               </div>
               <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                 <Image className="h-4 w-4 text-muted-foreground" />
               </div>
             </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
