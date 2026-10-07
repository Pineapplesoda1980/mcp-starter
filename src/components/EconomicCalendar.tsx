import React from 'react';
import { ECONOMIC_CALENDAR_EVENTS } from '../data/marketData';
import { Calendar, AlertCircle } from 'lucide-react';

export const EconomicCalendar: React.FC = () => {
  return (
    <div className="w-full rounded-xl border border-[#2a2e39] bg-[#1e222d] p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39] mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#2962ff]" />
          <h3 className="text-lg font-bold text-white tracking-tight">Economic Calendar</h3>
        </div>
        <span className="text-xs text-[#787b86]">Today's Releases</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono tabular-nums">
          <thead>
            <tr className="border-b border-[#2a2e39] text-[#787b86] pb-2">
              <th className="py-2 pr-2 font-medium">Time</th>
              <th className="py-2 px-2 font-medium">Cur</th>
              <th className="py-2 px-2 font-medium font-sans">Event</th>
              <th className="py-2 px-2 text-center font-medium font-sans">Impact</th>
              <th className="py-2 px-2 text-right font-medium">Act</th>
              <th className="py-2 px-2 text-right font-medium">Frc</th>
              <th className="py-2 pl-2 text-right font-medium">Prev</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50">
            {ECONOMIC_CALENDAR_EVENTS.map((event) => {
              const impactColor =
                event.impact === 'high'
                  ? 'text-[#f23645]'
                  : event.impact === 'medium'
                  ? 'text-[#f59e0b]'
                  : 'text-[#787b86]';

              return (
                <tr key={event.id} className="hover:bg-[#181c27] transition-colors">
                  <td className="py-2.5 pr-2 text-[#787b86] whitespace-nowrap">{event.time}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className="mr-1">{event.flag}</span>
                    <span className="font-semibold text-white">{event.country}</span>
                  </td>
                  <td className="py-2.5 px-2 font-sans font-medium text-white">{event.event}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-semibold uppercase text-[10px] ${impactColor}`}>
                      {event.impact === 'high' ? '●●●' : event.impact === 'medium' ? '●●○' : '●○○'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-white">{event.actual}</td>
                  <td className="py-2.5 px-2 text-right text-[#787b86]">{event.forecast}</td>
                  <td className="py-2.5 pl-2 text-right text-[#787b86]">{event.previous}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
