'use client'

import * as React from 'react'
import { Clock, FileText, Video, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HomeView() {
  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  if (currentHour >= 12) greeting = 'Good afternoon'
  if (currentHour >= 18) greeting = 'Good evening'

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground">Here's what's happening in your workspace.</p>
      </div>

      {/* Recently Visited */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Recently visited</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {['Project Alpha', 'Q3 Roadmap', 'Design Sync', 'User Interviews'].map((item, i) => (
             <Card key={i} className="hover:bg-accent/50 cursor-pointer transition-colors border-0 bg-muted/30 shadow-none">
               <CardHeader className="p-4">
                 <div className="flex items-center gap-2">
                   <FileText className="h-4 w-4 text-primary" />
                   <span className="font-medium text-sm truncate">{item}</span>
                 </div>
               </CardHeader>
               <CardContent className="p-4 pt-0">
                 <p className="text-xs text-muted-foreground">Edited {i + 1}h ago</p>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>

      {/* Last Documents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Last documents</span>
        </div>
        <Card className="border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0">
             <ScrollArea className="h-[320px]">
               <div className="divide-y">
                 {[
                    { title: 'Project Specs v2', author: 'Nathan Castro', time: '2h ago' },
                    { title: 'Meeting Notes - Jan 15', author: 'Team', time: '5h ago' },
                    { title: 'Q1 Marketing Strategy', author: 'Marketing', time: '1d ago' },
                    { title: 'Design System Guidelines', author: 'Design Team', time: '2d ago' },
                    { title: 'User Research Findings', author: 'Product', time: '3d ago' }
                 ].map((doc, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
                     <div className="flex items-center justify-center w-10 h-10 bg-background rounded-md border shrink-0">
                       <FileText className="h-5 w-5 text-muted-foreground" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="font-medium text-sm truncate group-hover:underline">{doc.title}</h4>
                       <p className="text-xs text-muted-foreground">Edited by {doc.author} • {doc.time}</p>
                     </div>
                     <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Open</Button>
                   </div>
                 ))}
               </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>

       {/* My Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">✓</span>
           <span>My tasks</span>
        </div>
         <Card className="border-0 bg-muted/30 shadow-none">
          <CardContent className="p-4 space-y-2">
             {['Review PR #123', 'Update documentation', 'Prepare for demo'].map((task, i) => (
               <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 group">
                 <div className="h-4 w-4 rounded border border-muted-foreground/50 group-hover:border-primary" />
                 <span className="text-sm">{task}</span>
               </div>
             ))}
             <div className="pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs">
                  + New task
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
