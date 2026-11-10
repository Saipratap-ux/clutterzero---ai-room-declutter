import React from 'react';
import { StorageSolution } from '../types/declutter';
import { Box, DollarSign, MapPin, CheckCircle, Lightbulb } from 'lucide-react';

interface StorageRecommendationsProps {
  solutions: StorageSolution[];
}

export const StorageRecommendations: React.FC<StorageRecommendationsProps> = ({ solutions }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Recommended Storage Systems & Hardware</h3>
        <p className="text-xs text-slate-500 mt-1">
          Targeted organizers chosen specifically for the clutter physics of this room.
          <em> Rule of thumb: Always declutter first, buy storage second!</em>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solutions.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {item.estimatedCost}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2">{item.name}</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Placement:</strong> {item.placement}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Impact:</strong> {item.benefit}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Universal Fit</span>
              <span className="text-emerald-700 font-medium">Standard Spec</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zero-Dollar / DIY Alternatives Card */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold text-amber-950 mb-0.5">Budget & Zero-Waste Organizing Tip:</p>
          Before purchasing new plastic bins, repurpose sturdy cardboard shoe boxes (wrap them in kraft paper for aesthetic consistency), clean glass jars for office accessories or spices, and use binder clips or twist ties for cord management.
        </div>
      </div>
    </div>
  );
};
