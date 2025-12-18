const FloatingInput = ({ children }: { children?: preact.JSX.Element | undefined }) => {
  return (
    <div class="fixed bottom-10 left-0 right-0 bg-background p-3 w-lg mx-auto shadow-[0_0_12px_2px_theme('colors.blue.400')] rounded-md">
      {children}
    </div>
  );
};

export default FloatingInput;
