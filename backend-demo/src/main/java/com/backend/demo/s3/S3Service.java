package com.backend.demo.s3;

import com.backend.demo.exception.AwsOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3;

    // Todo: try various properties in PutObjectRequest builder.
    public PutObjectResponse putObject(
            String bucketName,
            String objectKey,
            MultipartFile file,
            String cache,
            String type
    ) throws S3Exception {

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(type)
                .contentDisposition("inline")
                .cacheControl(cache)
                .build();

        try(InputStream inputStream = file.getInputStream()) {
            return s3.putObject(request, RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (Exception e) {
            throw new AwsOperationException(e.getMessage(),
                    "There was an error in putObject: %s".formatted(request)
            );
        }
    }


    public String getPublicUrl(
            String bucket,
            String key
    ) throws S3Exception {
        GetUrlRequest request = GetUrlRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        try {
            return s3.utilities().getUrl(request).toExternalForm();
        } catch (Exception e) {
            throw new AwsOperationException(e.getMessage(),
                    "There is an error occurred in getPublicUrl %s".formatted(request)
            );
        }
    }


    public void deleteObject(
            String key,
            String version,
            String bucket
    ) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .key(key)
                .versionId(version)
                .bucket(bucket)
                .build();
        try {
            s3.deleteObject(request);
        } catch (Exception e) {
            throw new AwsOperationException(e.getMessage(),
                    "There is an error on deleteObject %s".formatted(request)
            );
        }
    }


    public String generatePreSignUrl(
            String key,
            String bucket,
            String versionId
    ) {
        S3Presigner presigner = S3Presigner.create();

        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .versionId(versionId)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofDays(7))
                .getObjectRequest(objectRequest)
                .build();

        try {
            PresignedGetObjectRequest presignedRequest =
                    presigner.presignGetObject(presignRequest);

            return presignedRequest.url().toExternalForm();
        } catch (Exception e) {
            throw new AwsOperationException(e.getMessage(),
                    "There is an error on generatePreSignUrl %s".formatted(presignRequest)
            );
        }
    }

    @Async
    public void deleteBucketObjects(
            String bucketName,
            List<ObjectIdentifier> keys
    ) throws S3Exception {
        Delete request = Delete.builder()
                .objects(keys)
                .build();

        DeleteObjectsRequest objectRequests = DeleteObjectsRequest.builder()
                .bucket(bucketName)
                .delete(request)
                .build();
        try {
            s3.deleteObjects(objectRequests);
        } catch (Exception e) {
            throw new AwsOperationException(e.getMessage(),
                    "There is an error on deleteBucketObjects %s".formatted(objectRequests)
            );
        }
    }


    public byte[] getObject(String bucketName, String key, String versionId) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .versionId(versionId)
                .build();

        ResponseInputStream<GetObjectResponse> res = s3.getObject(getObjectRequest);

        try {
            return res.readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

}
