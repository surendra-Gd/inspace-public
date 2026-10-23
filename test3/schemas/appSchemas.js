import * as yup from "yup";

const spaceIdPattern = /^(?=.*[a-z])[a-z0-9_-]{8,20}$/;
const spaceNamePattern = /^(?!.*['";\\*]).{6,20}$/;

const spaceIdError = "SpaceId must have at least one lowercase letter[a-z] and can only allowed lowercase letters[a-z], numbers[0-9], hyphens[-], or underscores[_] eg:space_id-1";
const spaceNameError = "Space name contains invalid characters.";

export const createSpaceSchema = yup.object().shape({
    spaceId: yup
        .string()
        .trim()
        .required("Space Id Required")
        .min(8, "SpaceId must be at least 8 characters")
        .max(20, "Maximum exceeded")
        .matches(spaceIdPattern, {message: spaceIdError}),
    spaceName: yup
        .string()
        .trim()
        .required("Space name Required")
        .min(6, "Space name must be at least 6 characters")
        .max(20, "Maximum exceeded")
        .matches(spaceNamePattern, {message: spaceNameError})
});

export const spaceIdSchema = yup.object().shape({
    spaceId: yup
        .string()
        .trim()
        .required("Space Id Required")
        .min(8, "SpaceId must be at least 8 characters")
        .max(20, "Maximum exceeded")
        .matches(spaceIdPattern, {message: spaceIdError})
});

export const spaceNameSchema = yup.object().shape({
    spacename: yup
        .string()
        .trim()
        .required("Space name Required")
        .min(6, "Space name must be at least 6 characters")
        .max(20, "Maximum exceeded")
        .matches(spaceNamePattern, {message: spaceNameError})
});