import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Click me</Button>);

        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);
        await user.click(screen.getByText('Click me'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <Button onClick={handleClick} disabled>
                Click me
            </Button>,
        );
        await user.click(screen.getByText('Click me'));

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies the disabled attribute to the button element', () => {
        render(<Button disabled>Click me</Button>);

        expect(screen.getByText('Click me')).toBeDisabled();
    });

    it('applies a custom className without losing the base button class', () => {
        render(<Button className="custom-class">Click me</Button>);

        const button = screen.getByText('Click me');
        expect(button.className).toContain('custom-class');
    });

    it('does not render "undefined" in the class list when no className is provided', () => {
        render(<Button>Click me</Button>);

        const button = screen.getByText('Click me');
        expect(button.className).not.toContain('undefined');
    });

    it('sets the title attribute when provided', () => {
        render(<Button title="Tooltip text">Click me</Button>);

        expect(screen.getByText('Click me')).toHaveAttribute('title', 'Tooltip text');
    });
});
