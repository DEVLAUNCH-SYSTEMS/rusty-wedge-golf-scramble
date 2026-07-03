"use client";

import { Component, type ReactNode } from "react";

import { FormMessage } from "@/components/forms/form-message";

type ClientErrorBoundaryProps = {
  children: ReactNode;
  message: string;
};

type ClientErrorBoundaryState = {
  hasError: boolean;
};

export class ClientErrorBoundary extends Component<
  ClientErrorBoundaryProps,
  ClientErrorBoundaryState
> {
  state: ClientErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ClientErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <FormMessage tone="error" message={this.props.message} />;
    }

    return this.props.children;
  }
}
