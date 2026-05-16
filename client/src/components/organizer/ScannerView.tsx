import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CampusEvent } from '../../types';
import { ScanLine, Users, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Props {
  events: CampusEvent[];
  onCheckIn: any;
  registrations: any[];
}

export function ScannerView({ events, onCheckIn, registrations }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const handleScan = async (code: string) => {
    if (!selectedEventId) { toast.error("Select an event first!"); return; }
    const reg = registrations.find((r: any) => r.qrCode === code && r.eventId === selectedEventId);
    if (reg) {
      const success = await onCheckIn(selectedEventId, reg.userEmail);
      setScanResult(success ? 'success' : 'error');
    } else {
      setScanResult('error');
      toast.error("Invalid QR Code!");
    }
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight uppercase">Live Attendance Hub</h2>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Verify credentials and manage entry flows.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border-[2.5px] border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] overflow-hidden">
          <div className="bg-muted p-6 border-b-[2.5px] border-foreground">
            <h3 className="font-black uppercase tracking-tight text-lg">Device Scanner</h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Select an event to start checking in students.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em]">Active Event</Label>
              <Select onValueChange={setSelectedEventId}>
                <SelectTrigger className="h-12 rounded-none border-[2.5px] border-foreground"><SelectValue placeholder="Select event to scan for" /></SelectTrigger>
                <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="relative aspect-square bg-black overflow-hidden flex flex-col items-center justify-center border-[2.5px] border-foreground">
              {!selectedEventId ? (
                <div className="text-center space-y-2 p-12">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an event to activate camera.</p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <ScanLine className="h-32 w-32 text-primary opacity-20 animate-pulse" />
                  </div>
                  {scanResult === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-secondary flex flex-col items-center justify-center text-secondary-foreground z-10">
                      <CheckCircle2 className="h-20 w-20" /><p className="text-xl font-black mt-4 uppercase tracking-[0.2em]">Check-in Success</p>
                    </motion.div>
                  )}
                  {scanResult === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-destructive flex flex-col items-center justify-center text-white z-10">
                      <XCircle className="h-20 w-20" /><p className="text-xl font-black mt-4 uppercase tracking-[0.2em]">Invalid Ticket</p>
                    </motion.div>
                  )}
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 border-[3px] border-white/40 border-dashed pointer-events-none" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t-[2px] border-foreground/20" /></div><div className="relative flex justify-center text-[9px] uppercase"><span className="bg-card px-3 text-muted-foreground font-black tracking-[0.2em]">Manual Entry</span></div></div>
              <div className="flex gap-2">
                <Input placeholder="Enter code (e.g. QR-E1-ALEX)" className="rounded-none border-[2.5px] border-foreground uppercase h-11 font-mono" value={manualCode} onChange={e => setManualCode(e.target.value)} />
                <button className="h-11 px-6 font-black text-[9px] uppercase tracking-[0.15em] bg-primary text-white border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => handleScan(manualCode.toLowerCase())}>Verify</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-[2.5px] border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] h-fit">
          <div className="p-6 border-b-[2.5px] border-foreground"><h3 className="font-black uppercase tracking-tight text-lg">Recent Logs</h3></div>
          <div className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y-[2px] divide-foreground/10 px-6">
                {registrations.filter((r: any) => r.eventId === selectedEventId).sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)).map((reg: any) => (
                  <div key={reg.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black">{reg.userName || reg.userEmail}</p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{new Date(reg.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 border-[2px] ${reg.checkedIn ? 'border-secondary bg-secondary/10 text-secondary' : 'border-foreground/20 bg-muted text-muted-foreground'}`}>
                      {reg.checkedIn ? 'ARRIVED' : 'PENDING'}
                    </span>
                  </div>
                ))}
                {registrations.filter((r: any) => r.eventId === selectedEventId).length === 0 && (
                  <div className="py-20 text-center text-muted-foreground"><p className="text-xs font-black opacity-50 uppercase tracking-[0.2em]">No entries yet</p></div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
