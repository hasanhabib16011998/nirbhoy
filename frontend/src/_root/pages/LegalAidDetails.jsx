import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { useGetLegalAidById } from '@/lib/react-query/queriesAndMutations';
import Chat from '@/components/shared/Chat';
import ResolutionPanel from '@/components/shared/ResolutionPanel';

const LegalAidDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Assuming this hook returns a refetch function so we can refresh the data when resolved
  const { data: application, isLoading, isError } = useGetLegalAidById(id);

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <p className="text-light-1">Case not found or an error occurred.</p>
      </div>
    );
  }

  // ✅ Determine if the case is still active (adjust string based on your Django choices)
  const isCaseActive = application.status.toLowerCase() !== 'closed';



  return (
    <div className="flex flex-1 w-full flex-col px-5 py-10 lg:px-14 md:py-14">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center w-full mb-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="shad-button_ghost"
        >
          <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
        
        <div className="px-4 py-2 bg-dark-4 rounded-full border border-dark-3">
          <p className="text-primary-500 font-bold text-sm">Status: {application.status.toUpperCase()}</p>
        </div>
      </div>

      {/* --- GRID LAYOUT SETUP --- */}
      <div className="flex flex-col xl:flex-row gap-8 w-full">
        
        {/* LEFT SIDE: Case Details (Takes up remaining space) */}
        <div className="flex-1 bg-dark-2 border border-dark-4 rounded-[30px] p-8 xl:p-10 h-fit">
          
          {/* Applicant Info */}
          <div className="flex items-start gap-4 mb-8 border-b border-dark-4 pb-6">
            <img 
              src={application.applicant?.profile_image || "/assets/icons/profile-placeholder.svg"} 
              alt="applicant" 
              className="w-14 h-14 rounded-full object-cover mt-1"
            />
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="body-bold text-light-1">
                    {application.applicant?.first_name} {application.applicant?.last_name}
                  </p>
                  <p className="small-regular text-light-3">
                    @{application.applicant?.username} • {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-3 bg-dark-3 p-3 rounded-lg w-fit border border-dark-4">
                {application.applicant?.phone_number && (
                  <p className="small-medium text-light-2 flex items-center gap-2">
                    📞 {application.applicant.phone_number}
                  </p>
                )}
                {application.applicant?.email && (
                  <p className="small-medium text-light-2 flex items-center gap-2">
                    ✉️ {application.applicant.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Case Details */}
          <div className="mb-10">
            <h2 className="h2-bold text-white mb-4">{application.caption}</h2>
            <p className="base-regular text-light-2 whitespace-pre-wrap leading-relaxed">
              {application.description}
            </p>
          </div>

          {/* Attachments */}
          {application.attachments && application.attachments.length > 0 && (
            <div className="mb-10">
              <h3 className="h3-bold text-light-1 mb-4 border-t border-dark-4 pt-6">
                Attached Evidence
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {application.attachments.map((attachment) => {
                  const isPdf = attachment.file.toLowerCase().endsWith('.pdf');
                  return isPdf ? (
                    <a 
                      key={attachment.id} 
                      href={attachment.file} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 bg-dark-3 border border-dark-4 rounded-xl hover:bg-dark-4 transition-colors h-32"
                    >
                      <span className="text-4xl mb-2">📄</span>
                      <p className="text-xs text-light-2 text-center break-all line-clamp-2">View PDF</p>
                    </a>
                  ) : (
                    <a key={attachment.id} href={attachment.file} target="_blank" rel="noreferrer">
                      <img 
                        src={attachment.file} 
                        alt="evidence" 
                        className="w-full h-32 object-cover rounded-xl border border-dark-4 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Responders Info */}
          {application.responders && application.responders.length > 0 && (
            <div className="border-t border-dark-4 pt-6">
              <h3 className="h3-bold text-light-1 mb-4">Assigned Lawyers / Responders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.responders.map((responder) => (
                  <div key={responder.id} className="flex items-center gap-4 bg-dark-3 p-4 rounded-xl border border-dark-4">
                    <img
                      src={responder.profile_image || "/assets/icons/profile-placeholder.svg"}
                      alt="responder"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <p className="body-bold text-light-1 truncate">
                        {responder.first_name} {responder.last_name} <span className="small-regular text-light-3">(@{responder.username})</span>
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        {responder.phone_number && (
                          <p className="small-medium text-light-2 flex items-center gap-2 truncate">📞 {responder.phone_number}</p>
                        )}
                        {responder.email && (
                          <p className="small-medium text-light-2 flex items-center gap-2 truncate">✉️ {responder.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ RESOLUTION PANEL */}
          <div className="mt-8">
            <ResolutionPanel 
              modelName="legalaidapplication" // Must be lowercase for Django ContentType
              objectId={id}
              isMainActive={isCaseActive}
            />
          </div>

        </div>

        {/* RIGHT SIDE: Chat Component (Fixed width on large screens) */}
        <div className="w-full xl:w-[450px] shrink-0">
          <Chat 
            modelName="legalaidapplication"
            objectId={id} 
            title="Case Discussion"
          />
        </div>

      </div>
    </div>
  );
};

export default LegalAidDetails;