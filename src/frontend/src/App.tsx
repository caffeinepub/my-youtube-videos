import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useListVideos, useSyncVideos } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut, Play, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Video } from "./backend";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TheOrangeRant />
      <Toaster />
    </QueryClientProvider>
  );
}

function TheOrangeRant() {
  const { actor, isFetching } = useActor();
  const { data: videos, isLoading: isLoadingVideos } = useListVideos();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const syncVideos = useSyncVideos();
  const syncedRef = useRef(false);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isSyncing = syncVideos.isPending;
  const isLoading = isLoadingVideos || isSyncing;

  // Auto-sync once when the actor becomes ready
  useEffect(() => {
    if (actor && !isFetching && !syncedRef.current) {
      syncedRef.current = true;
      syncVideos.mutate();
    }
  }, [actor, isFetching, syncVideos]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.12 0.01 255)" }}
    >
      {/* Navbar */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "oklch(0.10 0.01 255 / 0.95)",
          borderColor: "oklch(0.21 0.015 255)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.62 0.22 32 / 0.2)" }}
            >
              <Youtube
                className="w-5 h-5"
                style={{ color: "oklch(0.62 0.22 32)" }}
              />
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "oklch(0.62 0.22 32)" }}
            >
              TheOrangeRant
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing && (
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: "oklch(0.68 0.015 255)" }}
                data-ocid="header.syncing.loading_state"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing…
              </span>
            )}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                data-ocid="header.logout.button"
                className="gap-2 text-sm"
                style={{ color: "oklch(0.68 0.015 255)" }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => login()}
                disabled={isLoggingIn}
                data-ocid="header.login.button"
                className="gap-2 text-sm"
                style={{ color: "oklch(0.68 0.015 255)" }}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="border-b"
        style={{
          borderColor: "oklch(0.21 0.015 255)",
          background:
            "linear-gradient(180deg, oklch(0.15 0.02 265 / 0.3) 0%, transparent 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-4xl sm:text-5xl font-bold mb-3"
              style={{ color: "oklch(0.96 0.005 255)" }}
            >
              Watch the latest{" "}
              <span style={{ color: "oklch(0.62 0.22 32)" }}>rants</span>
            </h1>
            <p className="text-lg" style={{ color: "oklch(0.68 0.015 255)" }}>
              Unfiltered takes, hot topics, and everything in between.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-32 gap-4"
            data-ocid="videos.loading_state"
          >
            <Loader2
              className="w-10 h-10 animate-spin"
              style={{ color: "oklch(0.52 0.22 265)" }}
            />
            <p style={{ color: "oklch(0.68 0.015 255)" }}>
              {isSyncing ? "Syncing videos…" : "Loading videos…"}
            </p>
          </div>
        ) : !videos?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-6"
            data-ocid="videos.empty_state"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.15 0.012 255)" }}
            >
              <Youtube
                className="w-10 h-10"
                style={{ color: "oklch(0.62 0.22 32)" }}
              />
            </div>
            <div className="text-center">
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "oklch(0.96 0.005 255)" }}
              >
                No videos yet
              </h2>
              <p style={{ color: "oklch(0.68 0.015 255)" }}>
                Check back soon for new content.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            data-ocid="videos.list"
          >
            {videos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                index={i + 1}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Video Modal */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent
          className="max-w-4xl p-0 border overflow-hidden"
          style={{
            backgroundColor: "oklch(0.15 0.012 255)",
            borderColor: "oklch(0.21 0.015 255)",
          }}
          data-ocid="video.modal"
        >
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId}?autoplay=1`}
                    title={selectedVideo.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <h2
                    className="text-xl font-bold mb-1 leading-snug"
                    style={{ color: "oklch(0.96 0.005 255)" }}
                  >
                    {selectedVideo.title}
                  </h2>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "oklch(0.68 0.015 255)" }}
                  >
                    {formatDate(selectedVideo.createdAt)}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.78 0.01 255)" }}
                  >
                    {selectedVideo.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{
          borderColor: "oklch(0.21 0.015 255)",
          backgroundColor: "oklch(0.10 0.01 255)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg font-bold"
            style={{ color: "oklch(0.62 0.22 32)" }}
          >
            TheOrangeRant
          </span>
          <div
            className="flex items-center gap-6 text-sm"
            style={{ color: "oklch(0.68 0.015 255)" }}
          >
            <a
              href="https://youtube.com/@therealorangeguy711"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
              data-ocid="footer.youtube.link"
            >
              <Youtube
                className="w-4 h-4"
                style={{ color: "oklch(0.62 0.22 32)" }}
              />
              YouTube Channel
            </a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-center text-xs"
          style={{ color: "oklch(0.5 0.01 255)" }}
        >
          Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "oklch(0.52 0.22 265)" }}
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

function VideoCard({
  video,
  index,
  onClick,
}: {
  video: Video;
  index: number;
  onClick: () => void;
}) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      className="group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: "oklch(0.15 0.012 255)",
        borderColor: "oklch(0.21 0.015 255)",
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)",
      }}
      onClick={onClick}
      data-ocid={`videos.item.${index}`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: "oklch(0 0 0 / 0.5)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "oklch(0.52 0.22 265 / 0.9)" }}
          >
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 2px oklch(0.52 0.22 265)" }}
        />
      </div>
      {/* Card info */}
      <div className="p-4">
        <h3
          className="font-semibold text-base leading-snug mb-1 line-clamp-2"
          style={{ color: "oklch(0.96 0.005 255)" }}
        >
          {video.title}
        </h3>
        <p className="text-xs mb-2" style={{ color: "oklch(0.68 0.015 255)" }}>
          {formatDate(video.createdAt)}
        </p>
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: "oklch(0.75 0.01 255)" }}
        >
          {video.description}
        </p>
      </div>
    </motion.div>
  );
}

function formatDate(nanoseconds: bigint): string {
  try {
    const ms = Number(nanoseconds) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
