'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  MessageCircle,
  Heart,
  Share,
  TrendingUp,
  Award,
  Star,
  Zap,
  Crown,
  Shield
} from 'lucide-react'

interface CommunityMember {
  id: string
  name: string
  avatar?: string
  role: 'member' | 'moderator' | 'expert'
  reputation: number
  level: number
  badges: string[]
  connections: number
  posts: number
  followers: number
  following: boolean
  online: boolean
  lastActive: string
}

interface SocialConnection {
  from: string
  to: string
  strength: 'weak' | 'medium' | 'strong'
  type: 'colleague' | 'mentor' | 'friend'
}

export default function SocialGraph() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  // Mock community members
  const members: CommunityMember[] = [
    {
      id: '1',
      name: 'Nguyễn Thị Alpha',
      role: 'expert',
      reputation: 2850,
      level: 15,
      badges: ['Top Trader', 'Mentor', 'Consistency King'],
      connections: 47,
      posts: 156,
      followers: 234,
      following: true,
      online: true,
      lastActive: 'now'
    },
    {
      id: '2',
      name: 'Trần Văn Beta',
      role: 'moderator',
      reputation: 1920,
      level: 12,
      badges: ['Community Builder', 'Referral Champion'],
      connections: 38,
      posts: 98,
      followers: 156,
      following: false,
      online: false,
      lastActive: '2h ago'
    },
    {
      id: '3',
      name: 'Lê Hoàng Gamma',
      role: 'member',
      reputation: 1450,
      level: 9,
      badges: ['Rising Star', 'Fast Learner'],
      connections: 29,
      posts: 67,
      followers: 89,
      following: true,
      online: true,
      lastActive: 'now'
    },
    {
      id: '4',
      name: 'Phạm Minh Delta',
      role: 'member',
      reputation: 890,
      level: 6,
      badges: ['Newcomer', 'Active Poster'],
      connections: 15,
      posts: 34,
      followers: 45,
      following: false,
      online: false,
      lastActive: '1d ago'
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'expert':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'expert':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 2500) return { name: 'Legend', color: 'text-red-600' }
    if (reputation >= 1500) return { name: 'Expert', color: 'text-purple-600' }
    if (reputation >= 800) return { name: 'Advanced', color: 'text-blue-600' }
    if (reputation >= 300) return { name: 'Intermediate', color: 'text-green-600' }
    return { name: 'Beginner', color: 'text-gray-600' }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          🐺 Hang Sói Social Network
        </h2>
        <p className="text-muted-foreground">
          Connect with fellow traders and build your reputation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total Members</span>
              </div>
              <span className="font-bold">1,247</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active Discussions</span>
              </div>
              <span className="font-bold">89</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm">New Members Today</span>
              </div>
              <span className="font-bold">+12</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Top Contributors</span>
              </div>
              <span className="font-bold">47</span>
            </div>
          </CardContent>
        </Card>

        {/* Member Directory */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Members Directory</CardTitle>
            <CardDescription>
              Discover and connect with community members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => {
                const repLevel = getReputationLevel(member.reputation)
                return (
                  <div
                    key={member.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                      selectedMember === member.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{member.name}</h3>
                            {getRoleIcon(member.role)}
                          </div>
                          <Badge className={getRoleColor(member.role)} variant="outline">
                            {member.role}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className={`font-medium ${repLevel.color}`}>
                            Level {member.level} • {repLevel.name}
                          </span>
                          <span>{member.connections} connections</span>
                          <span>{member.posts} posts</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {member.badges.slice(0, 3).map((badge) => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {member.reputation} rep
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {member.followers} followers
                            </span>
                            <span>Active {member.lastActive}</span>
                          </div>

                          <Button
                            size="sm"
                            variant={member.following ? "outline" : "default"}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle follow/unfollow
                            }}
                          >
                            {member.following ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedMember === member.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Reputation Progress</div>
                            <Progress
                              value={(member.reputation % 500) / 5}
                              className="h-2 mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {member.reputation} / {(Math.floor(member.reputation / 500) + 1) * 500} to next level
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Engagement Score</div>
                            <div className="text-lg font-bold text-blue-600">
                              {Math.round((member.posts * 10 + member.connections * 5 + member.reputation * 0.1) / 10)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="h-4 w-4 mr-1" />
                            Share Profile
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Connections</CardTitle>
          <CardDescription>
            Traders you might want to connect with based on your activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {members.slice(0, 4).map((member) => (
              <div key={member.id} className="text-center space-y-2 p-4 border rounded-lg">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-sm">{member.name}</h3>
                <div className="flex justify-center gap-1">
                  {member.badges.slice(0, 2).map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" className="w-full">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
