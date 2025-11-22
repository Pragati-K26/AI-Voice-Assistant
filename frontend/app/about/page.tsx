'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function AboutContent() {
  const { isAuthenticated, user } = useAuth()
  
  const team = [
    {
      name: 'David Kim',
      role: 'CEO & Co-Founder',
      bio: 'Former VP of Engineering at major fintech company with 15+ years of experience.',
      image: 'https://i.pravatar.cc/300?img=33',
    },
    {
      name: 'Jennifer Martinez',
      role: 'CTO & Co-Founder',
      bio: 'AI and machine learning expert with a PhD from Stanford University.',
      image: 'https://i.pravatar.cc/300?img=20',
    },
    {
      name: 'Robert Chen',
      role: 'Head of Security',
      bio: 'Cybersecurity specialist with certifications in banking security protocols.',
      image: 'https://i.pravatar.cc/300?img=51',
    },
    {
      name: 'Amanda Foster',
      role: 'Head of Product',
      bio: 'UX designer and product strategist with a focus on financial technology.',
      image: 'https://i.pravatar.cc/300?img=9',
    },
  ]

  const values = [
    {
      title: 'Security First',
      description: 'We prioritize the safety and privacy of your financial data above all else.',
      icon: '🔒',
    },
    {
      title: 'User-Centric Design',
      description: 'Every feature is designed with the end user in mind for maximum usability.',
      icon: '👥',
    },
    {
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology.',
      icon: '💡',
    },
    {
      title: 'Transparency',
      description: 'Clear communication and honest practices in everything we do.',
      icon: '📋',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation isAuthenticated={isAuthenticated} user={user} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6">
              About VoiceBank
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're building the future of banking—one voice command at a time. 
              Our mission is to make financial management accessible, secure, and effortless for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold text-slate-900">
                Our Story
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                VoiceBank was founded in 2020 by a team of financial technology experts 
                who recognized the need for more intuitive banking solutions. We saw that 
                traditional banking interfaces were becoming outdated, and voice technology 
                presented an opportunity to revolutionize how people interact with their finances.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Today, we serve thousands of users who trust our platform for their daily 
                banking needs. Our commitment to security, innovation, and user experience 
                has made us a leader in voice-powered financial technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The talented individuals behind VoiceBank
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-slate-600 mb-3">{member.role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for 
            innovation and excellence.
          </p>
          <a
            href="/careers"
            className="inline-block px-10 py-5 bg-white text-slate-900 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-slate-50 transform hover:-translate-y-1"
          >
            View Open Positions
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function AboutPage() {
  return (
    <AuthProvider>
      <AboutContent />
    </AuthProvider>
  )
}

