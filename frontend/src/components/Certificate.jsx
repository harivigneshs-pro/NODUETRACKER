import { QRCodeSVG } from "qrcode.react";
import React from "react";
import { GraduationCap, Award } from "lucide-react";

const Certificate = ({ studentName, batch, date }) => {
    return (
        <div className="certificate-container relative bg-white w-full h-full flex flex-col items-center justify-center overflow-hidden">
            {/* Outer Border */}
            <div className="absolute inset-4 border-[12px] border-double border-indigo-900/80 pointer-events-none z-10"></div>

            {/* Inner Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>

            <div className="relative z-20 w-full max-w-4xl flex flex-col justify-between p-16 flex-grow">
                {/* Header */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center text-white mb-6 shadow-xl">
                        <GraduationCap size={44} />
                    </div>
                    <h1 className="text-5xl font-serif font-black text-indigo-950 tracking-wide uppercase mb-2">No Due Certificate</h1>
                    <div className="h-1 w-32 bg-indigo-500 mb-2"></div>
                    <p className="text-indigo-900/60 font-semibold tracking-[0.3em] text-sm uppercase">Official Clearance Document</p>
                </div>

                {/* Body */}
                <div className="my-8 space-y-6">
                    <p className="text-xl text-slate-600 font-serif italic">This is to certify that</p>

                    <div className="relative inline-block py-2 px-8 border-b-2 border-slate-300">
                        <h2 className="text-6xl font-serif font-bold text-indigo-900 capitalize">{studentName}</h2>
                    </div>

                    <div className="text-xl text-slate-700 leading-relaxed font-serif max-w-2xl mx-auto">
                        <p className="mb-2">Student of Batch <span className="font-bold text-indigo-950">{batch}</span></p>
                        <p>
                            Has successfully cleared all dues and completed all assigned tasks from the respective departments.
                            There are no pending obligations against this student as of <span className="font-bold text-indigo-950">{date}</span>.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="grid grid-cols-3 items-end gap-12 mt-8">
                    <div className="text-center">
                        <div className="h-px bg-slate-400 w-full mb-4"></div>
                        <p className="font-bold text-slate-800 uppercase text-xs tracking-wider">Principals Signature</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <QRCodeSVG
                                value={`CERT-NODUE-${studentName}-${batch}-${date}`}
                                size={80}
                                level={"H"}
                                className="opacity-90"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-semibold">Scan to Verify</p>
                    </div>

                    <div className="text-center relative">
                        {/* Stamp Effect */}
                        <div className="absolute bottom-8 right-12 transform rotate-[-20deg] opacity-20 pointer-events-none">
                            <Award size={120} className="text-indigo-900" />
                        </div>

                        <div className="inline-block border-4 border-emerald-600 text-emerald-600 px-4 py-2 font-black text-xl uppercase tracking-widest transform -rotate-6 rounded opacity-80 mb-4 mix-blend-multiply">
                            Verified
                        </div>
                        <div className="h-px bg-slate-400 w-full mb-4"></div>
                        <p className="font-bold text-slate-800 uppercase text-xs tracking-wider">Authorized Signatory</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0.5cm; size: landscape; }
                    .print-hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Certificate;
