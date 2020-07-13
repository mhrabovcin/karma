import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

import { CSSTransition } from "react-transition-group";

import { usePopper } from "react-popper";

import { useSupportsTouch } from "Hooks/useSupportsTouch";

const TooltipWrapper = ({ title, children, className }) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          boundariesElement: "viewport",
        },
      },
    ],
  });

  const supportsTouch = useSupportsTouch();
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);

  const showTooltip = () => setIsHovering(true);
  const hideTooltip = () => setIsHovering(false);

  useEffect(() => {
    let timerShow;
    let timerHide;

    if (!isHovering) {
      if (isVisible) {
        clearTimeout(timerShow);
        timerHide = setTimeout(() => setIsVisible(false), 100);
      }
      setWasClicked(false);
    } else if (wasClicked) {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
      setIsVisible(false);
    } else if (!isVisible && isHovering) {
      clearTimeout(timerHide);
      timerShow = setTimeout(() => setIsVisible(true), 1000);
    }
    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, [isHovering, isVisible, wasClicked]);

  return (
    <React.Fragment>
      <div
        onClick={() => setWasClicked(true)}
        onMouseOver={supportsTouch ? null : showTooltip}
        onMouseLeave={supportsTouch ? null : hideTooltip}
        onTouchStart={supportsTouch ? showTooltip : null}
        onTouchCancel={supportsTouch ? hideTooltip : null}
        onTouchEnd={supportsTouch ? hideTooltip : null}
        ref={setReferenceElement}
        className={`${className ? className : ""} tooltip-trigger`}
      >
        {children}
      </div>
      {isVisible
        ? createPortal(
            <CSSTransition
              classNames="components-animation-tooltip"
              timeout={200}
              appear
              enter
              in
              unmountOnExit
            >
              <div
                className="tooltip tooltip-inner"
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                {title}
              </div>
            </CSSTransition>,
            document.body
          )
        : null}
    </React.Fragment>
  );
};
TooltipWrapper.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { TooltipWrapper };
