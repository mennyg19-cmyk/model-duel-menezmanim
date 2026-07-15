"use client";

// === What's in this file ===
// A safety net around the live board inside the editor. If one widget throws while
// rendering (a half-typed setting, bad content), this catches it and shows a small
// message instead of blanking the whole editor -- so you can fix the widget rather
// than reload and lose your place.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidUpdate(prev: Props) {
    // Let a re-render (e.g. after the user fixes the offending setting) clear the error.
    if (prev.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-destructive">
          A widget couldn&apos;t be drawn: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
