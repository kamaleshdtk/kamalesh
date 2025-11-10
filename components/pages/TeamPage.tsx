import React from 'react';

const teamMembers = [
  {
    name: 'Alex Johnson',
    role: 'Founder & Lead AI Engineer',
    bio: 'Alex is the visionary behind Design Audit, combining a passion for machine learning with a deep understanding of user-centered design principles.',
    avatar: 'https://i.pravatar.cc/150?u=alex-johnson',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
  {
    name: 'Samantha Carter',
    role: 'Head of Product & UX Research',
    bio: 'With over a decade in UX research, Samantha ensures that every feature we build is intuitive, effective, and truly solves user problems.',
    avatar: 'https://i.pravatar.cc/150?u=samantha-carter',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
  {
    name: 'Ben Carter',
    role: 'Senior Frontend Developer',
    bio: 'Ben brings designs to life with pixel-perfect code and a relentless focus on on performance and accessibility. He loves crafting delightful user interfaces.',
    avatar: 'https://i.pravatar.cc/150?u=ben-carter',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
   {
    name: 'Olivia Martinez',
    role: 'Lead UI/UX Designer',
    bio: "Olivia is the creative force behind Design Audit's clean and intuitive interface. She believes that great design is not just what it looks like, but how it works.",
    avatar: 'https://i.pravatar.cc/150?u=olivia-martinez',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
];

const SocialIcon: React.FC<{ platform: 'twitter' | 'linkedin'; href: string }> = ({ platform, href }) => {
  const icons = {
    twitter: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.353.23-2.064.077.608 1.923 2.366 3.256 4.472 3.294-1.746 1.371-3.844 2.162-6.089 1.834 2.015 1.299 4.404 2.049 6.963 2.049 8.356 0 12.92-6.924 12.92-12.92 0-.195-.005-.39-.014-.583.884-.636 1.654-1.425 2.267-2.353z" /></svg>,
    linkedin: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors">
      {icons[platform]}
    </a>
  );
};


const TeamPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="mb-12 text-center">
                 <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-text-primary dark:text-white">
                    Meet the Team
                </h1>
                <p className="mt-4 text-md sm:text-lg text-text-secondary dark:text-gray-400 max-w-3xl mx-auto">
                   We are a passionate group of designers, developers, and AI enthusiasts dedicated to helping you create better user experiences.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                    <div key={member.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center flex flex-col items-center border border-gray-200 dark:border-gray-700">
                        <img src={member.avatar} alt={member.name} className="w-28 h-28 rounded-full mb-4 ring-4 ring-primary/20" />
                        <h3 className="text-xl font-bold text-text-primary dark:text-white">{member.name}</h3>
                        <p className="text-primary font-semibold text-sm">{member.role}</p>
                        <p className="text-text-secondary dark:text-gray-400 mt-3 text-sm flex-grow">{member.bio}</p>
                        <div className="mt-4 flex items-center gap-4">
                            <SocialIcon platform="twitter" href={member.social.twitter} />
                            <SocialIcon platform="linkedin" href={member.social.linkedin} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPage;