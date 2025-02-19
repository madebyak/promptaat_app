import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Plus, Crown } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start justify-between p-4 rounded-lg bg-mid_grey">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="text-lg">A</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-white">First Name LAST NAME</h1>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-sm rounded-full bg-dark_grey text-light_grey">
                FREE MEMBER
              </span>
              <Button variant="secondary" size="sm" className="gap-1.5 bg-mid_grey hover:main-gradient text-white">
                <Crown className="h-3.5 w-3.5 text-yellow-500" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalogs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Catalogs</h2>
          <Button variant="secondary" size="sm" className="gap-1.5 bg-mid_grey hover:main-gradient text-white">
            <Plus className="h-3.5 w-3.5" />
            New Catalog
          </Button>
        </div>
        <div className="rounded-lg bg-mid_grey p-8 text-center">
          <h3 className="text-base font-medium text-light_grey">No catalogs created yet</h3>
          <p className="mt-1.5 text-sm text-light_grey">
            Create a catalog to organize your favorite prompts.
          </p>
          <Button 
            className="mt-4 gap-1.5 main-gradient hover:bg-white hover:main-gradient-text" 
            variant="secondary"
            size="default"
          >
            <Plus className="h-4 w-4" />
            Create Your First Catalog
          </Button>
        </div>
      </div>

      {/* Recent Prompts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Prompts</h2>
          <Button variant="secondary" size="sm" className="gap-1.5 bg-mid_grey hover:main-gradient text-white">
            Browse More
          </Button>
        </div>
        <div className="rounded-lg bg-mid_grey p-8 text-center">
          <h3 className="text-base font-medium text-light_grey">No prompts saved yet</h3>
          <p className="mt-1.5 text-sm text-light_grey">
            Start exploring our collection to save your favorite prompts.
          </p>
          <Button 
            className="mt-4 gap-1.5 main-gradient hover:bg-white hover:main-gradient-text"
            variant="secondary"
            size="default"
          >
            Explore Prompts
          </Button>
        </div>
      </div>
    </div>
  );
}
