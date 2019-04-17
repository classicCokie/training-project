/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2017 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const valBetween = (val, min, max) => {
    return (Math.min(max, Math.max(min, val)))
}

/**
 * Shows how much of a task has completed with a visual indicator and an
 * optional text label
 */

const MyProgressBar = ({
    className,
    hasLabel,
    hasBorder,
    percentageComplete
}) => {
    const classes = classNames('c-my-progress-bar', {
        'c--border': hasBorder
    }, className)

    const cleanPercentageComplete = valBetween(percentageComplete, 0, 100)
    return (
        <div className={classes}>
            <div className="c-my-progress-bar__visual-indicator" style={{width: `${cleanPercentageComplete}%`}} />
            { hasLabel &&
                <div className="c-my-progress-bar__text-label">{cleanPercentageComplete}% complete</div>
            }
        </div>
    )
}

MyProgressBar.propTypes = {
    /**
     * The percentage of the task that has completed. Required.
     */
    percentageComplete: PropTypes.number.isRequired,
    /**
     * Adds values to the `class` attribute of the root element
     */
    className: PropTypes.string,
    /**
     * Determines if the progress bar has a border
     */
    hasBorder: PropTypes.bool,
     /**
     * Determines if the progress bar has a text label
     */
    hasLabel: PropTypes.bool
}

export default MyProgressBar
